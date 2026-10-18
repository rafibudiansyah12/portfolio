import {
  BadRequestException,
  ConflictException,
  Controller,
  Body,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AdminListQuery,
  AdminListQuerySchema,
  AdminProjectQuery,
  AdminProjectQuerySchema,
  ExperienceInput,
  ExperienceInputSchema,
  ProfilePatchInput,
  ProfilePatchSchema,
  ProjectCreateInput,
  ProjectCreateSchema,
  ProjectReorderInput,
  ProjectReorderSchema,
  ProjectUpdateInput,
  ProjectUpdateSchema,
  SkillInput,
  SkillInputSchema,
} from '@portfolio/shared';
import { z } from 'zod';
import { Role } from '../generated/prisma/client';
import { ZodValidationPipe } from '../auth/auth.validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/auth.types';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

function slugify(value: string): string {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'project';
}

function actorId(request: RequestWithUser): string {
  if (!request.user) throw new UnauthorizedException('Authenticated user is missing.');
  return request.user.sub;
}

function pageResult<T>(items: T[], total: number, query: AdminListQuery) {
  return {
    items,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

@Controller('admin/projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR)
@ApiBearerAuth()
@ApiTags('admin projects')
export class AdminProjectsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(AdminProjectQuerySchema)) query: AdminProjectQuery) {
    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' as const } },
              { slug: { contains: query.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
        include: { skills: { include: { skill: true } } },
      }),
      this.prisma.project.count({ where }),
    ]);
    return pageResult(items, total, query);
  }

  @Get(':id')
  async get(@Param('id', new ZodValidationPipe(z.string().uuid())) id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { skills: { include: { skill: true } }, images: { orderBy: { order: 'asc' } } },
    });
    if (!project) throw new NotFoundException('Project not found.');
    return project;
  }

  @Patch('reorder')
  async reorder(
    @Req() request: RequestWithUser,
    @Body(new ZodValidationPipe(ProjectReorderSchema)) body: ProjectReorderInput,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const projects = await transaction.project.findMany({
        where: { id: { in: body.projectIds } },
        select: { id: true },
      });
      if (projects.length !== body.projectIds.length) {
        throw new BadRequestException('All project IDs must exist before reordering.');
      }
      for (const [order, id] of body.projectIds.entries()) {
        await transaction.project.update({ where: { id }, data: { order } });
      }
      await transaction.auditLog.create({
        data: {
          userId: actorId(request),
          action: 'REORDER',
          entity: 'Project',
          entityId: null,
          meta: { projectIds: body.projectIds },
        },
      });
      return { projectIds: body.projectIds };
    });
  }

  @Post()
  async create(
    @Req() request: RequestWithUser,
    @Body(new ZodValidationPipe(ProjectCreateSchema)) body: ProjectCreateInput,
  ) {
    let slug = body.slug ?? slugify(body.title);
    if (body.slug === undefined) {
      const baseSlug = slug;
      let suffix = 2;
      while (await this.prisma.project.findUnique({ where: { slug }, select: { id: true } })) {
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
      }
    }
    await this.ensureRelations(
      body.skillIds,
      body.images.map((image) => image.mediaId),
    );
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const project = await transaction.project.create({
          data: {
            title: body.title,
            slug,
            summary: body.summary,
            client: body.client ?? null,
            problem: body.problem,
            solution: body.solution,
            result: body.result,
            thumbnailUrl: body.thumbnailUrl ?? null,
            repoUrl: body.repoUrl ?? null,
            demoUrl: body.demoUrl ?? null,
            featured: body.featured,
            order: body.order,
            status: body.status,
            publishAt: body.publishAt ? new Date(body.publishAt) : null,
            seoTitle: body.seoTitle ?? null,
            seoDescription: body.seoDescription ?? null,
            skills: {
              create: body.skillIds.map((skillId) => ({ skill: { connect: { id: skillId } } })),
            },
            images: {
              create: body.images.map(({ mediaId, ...image }) => ({
                ...image,
                media: { connect: { id: mediaId } },
              })),
            },
          },
          include: { skills: { include: { skill: true } }, images: { orderBy: { order: 'asc' } } },
        });
        await transaction.auditLog.create({
          data: {
            userId: actorId(request),
            action: 'CREATE',
            entity: 'Project',
            entityId: project.id,
            meta: { title: project.title, slug: project.slug },
          },
        });
        return project;
      });
    } catch (error) {
      if (this.isUniqueConflict(error))
        throw new ConflictException('A project with this slug already exists.');
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
    @Body(new ZodValidationPipe(ProjectUpdateSchema)) body: ProjectUpdateInput,
  ) {
    await this.ensureRelations(
      body.skillIds ?? [],
      body.images?.map((image) => image.mediaId) ?? [],
    );
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const current = await transaction.project.findUnique({ where: { id } });
        if (!current) throw new NotFoundException('Project not found.');
        if (
          (body.status ?? current.status) === 'SCHEDULED' &&
          (body.publishAt === null || (body.publishAt === undefined && current.publishAt === null))
        ) {
          throw new BadRequestException('Set publishAt when scheduling a project.');
        }
        const project = await transaction.project.update({
          where: { id },
          data: {
            ...(body.title !== undefined ? { title: body.title } : {}),
            ...(body.slug !== undefined ? { slug: body.slug } : {}),
            ...(body.summary !== undefined ? { summary: body.summary } : {}),
            ...(body.client !== undefined ? { client: body.client } : {}),
            ...(body.problem !== undefined ? { problem: body.problem } : {}),
            ...(body.solution !== undefined ? { solution: body.solution } : {}),
            ...(body.result !== undefined ? { result: body.result } : {}),
            ...(body.thumbnailUrl !== undefined ? { thumbnailUrl: body.thumbnailUrl } : {}),
            ...(body.repoUrl !== undefined ? { repoUrl: body.repoUrl } : {}),
            ...(body.demoUrl !== undefined ? { demoUrl: body.demoUrl } : {}),
            ...(body.featured !== undefined ? { featured: body.featured } : {}),
            ...(body.order !== undefined ? { order: body.order } : {}),
            ...(body.status !== undefined ? { status: body.status } : {}),
            ...(body.publishAt !== undefined
              ? { publishAt: body.publishAt ? new Date(body.publishAt) : null }
              : {}),
            ...(body.seoTitle !== undefined ? { seoTitle: body.seoTitle } : {}),
            ...(body.seoDescription !== undefined ? { seoDescription: body.seoDescription } : {}),
            ...(body.skillIds !== undefined
              ? {
                  skills: {
                    deleteMany: {},
                    create: body.skillIds.map((skillId) => ({
                      skill: { connect: { id: skillId } },
                    })),
                  },
                }
              : {}),
            ...(body.images !== undefined
              ? {
                  images: {
                    deleteMany: {},
                    create: body.images.map(({ mediaId, ...image }) => ({
                      ...image,
                      media: { connect: { id: mediaId } },
                    })),
                  },
                }
              : {}),
          },
          include: { skills: { include: { skill: true } }, images: { orderBy: { order: 'asc' } } },
        });
        await transaction.auditLog.create({
          data: {
            userId: actorId(request),
            action: 'UPDATE',
            entity: 'Project',
            entityId: project.id,
            meta: { previousSlug: current.slug, slug: project.slug },
          },
        });
        return project;
      });
    } catch (error) {
      if (this.isUniqueConflict(error))
        throw new ConflictException('A project with this slug already exists.');
      throw error;
    }
  }

  @Delete(':id')
  async delete(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const project = await transaction.project.findUnique({
        where: { id },
        select: { id: true, title: true, slug: true },
      });
      if (!project) throw new NotFoundException('Project not found.');
      await transaction.project.delete({ where: { id } });
      await transaction.auditLog.create({
        data: {
          userId: actorId(request),
          action: 'DELETE',
          entity: 'Project',
          entityId: project.id,
          meta: { title: project.title, slug: project.slug },
        },
      });
      return { deleted: true };
    });
  }

  private async ensureRelations(skillIds: string[], mediaIds: string[]): Promise<void> {
    const uniqueSkills = [...new Set(skillIds)];
    const uniqueMedia = [...new Set(mediaIds)];
    if (uniqueSkills.length !== skillIds.length || uniqueMedia.length !== mediaIds.length) {
      throw new BadRequestException('Relation identifiers must be unique.');
    }
    const [skills, media] = await Promise.all([
      uniqueSkills.length ? this.prisma.skill.count({ where: { id: { in: uniqueSkills } } }) : 0,
      uniqueMedia.length ? this.prisma.media.count({ where: { id: { in: uniqueMedia } } }) : 0,
    ]);
    if (skills !== uniqueSkills.length || media !== uniqueMedia.length) {
      throw new BadRequestException('One or more selected skills or media items do not exist.');
    }
  }

  private isUniqueConflict(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
  }
}

@Controller('admin/skills')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR)
@ApiBearerAuth()
@ApiTags('admin skills')
export class AdminSkillsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(AdminListQuerySchema)) query: AdminListQuery) {
    const where = query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' as const } },
            { category: { contains: query.q, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.skill.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.skill.count({ where }),
    ]);
    return pageResult(items, total, query);
  }

  @Post()
  async create(
    @Req() request: RequestWithUser,
    @Body(new ZodValidationPipe(SkillInputSchema)) body: SkillInput,
  ) {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const skill = await transaction.skill.create({ data: body });
        await transaction.auditLog.create({
          data: {
            userId: actorId(request),
            action: 'CREATE',
            entity: 'Skill',
            entityId: skill.id,
            meta: { name: skill.name },
          },
        });
        return skill;
      });
    } catch (error) {
      if (this.isUniqueConflict(error))
        throw new ConflictException('A skill with this name already exists.');
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
    @Body(
      new ZodValidationPipe(
        SkillInputSchema.partial().refine((value) => Object.keys(value).length > 0),
      ),
    )
    body: Partial<SkillInput>,
  ) {
    const current = await this.prisma.skill.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Skill not found.');
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const skill = await transaction.skill.update({ where: { id }, data: body });
        await transaction.auditLog.create({
          data: {
            userId: actorId(request),
            action: 'UPDATE',
            entity: 'Skill',
            entityId: skill.id,
            meta: { name: skill.name },
          },
        });
        return skill;
      });
    } catch (error) {
      if (this.isUniqueConflict(error))
        throw new ConflictException('A skill with this name already exists.');
      throw error;
    }
  }

  @Delete(':id')
  async delete(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const skill = await transaction.skill.findUnique({
        where: { id },
        select: { id: true, name: true },
      });
      if (!skill) throw new NotFoundException('Skill not found.');
      await transaction.skill.delete({ where: { id } });
      await transaction.auditLog.create({
        data: {
          userId: actorId(request),
          action: 'DELETE',
          entity: 'Skill',
          entityId: skill.id,
          meta: { name: skill.name },
        },
      });
      return { deleted: true };
    });
  }

  private isUniqueConflict(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
  }
}

@Controller('admin/experiences')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR)
@ApiBearerAuth()
@ApiTags('admin experiences')
export class AdminExperiencesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(AdminListQuerySchema)) query: AdminListQuery) {
    const where = query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: 'insensitive' as const } },
            { organization: { contains: query.q, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.experience.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [{ startDate: 'desc' }, { order: 'asc' }],
      }),
      this.prisma.experience.count({ where }),
    ]);
    return pageResult(items, total, query);
  }

  @Post()
  async create(
    @Req() request: RequestWithUser,
    @Body(new ZodValidationPipe(ExperienceInputSchema)) body: ExperienceInput,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const experience = await transaction.experience.create({
        data: {
          ...body,
          startDate: new Date(body.startDate),
          endDate: body.endDate ? new Date(body.endDate) : null,
        },
      });
      await transaction.auditLog.create({
        data: {
          userId: actorId(request),
          action: 'CREATE',
          entity: 'Experience',
          entityId: experience.id,
          meta: { title: experience.title },
        },
      });
      return experience;
    });
  }

  @Patch(':id')
  async update(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
    @Body(
      new ZodValidationPipe(
        ExperienceInputSchema.partial().refine((value) => Object.keys(value).length > 0),
      ),
    )
    body: Partial<ExperienceInput>,
  ) {
    const current = await this.prisma.experience.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Experience not found.');
    const data = {
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.organization !== undefined ? { organization: body.organization } : {}),
      ...(body.startDate !== undefined ? { startDate: new Date(body.startDate) } : {}),
      ...(body.endDate !== undefined
        ? { endDate: body.endDate ? new Date(body.endDate) : null }
        : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.order !== undefined ? { order: body.order } : {}),
    };
    return this.prisma.$transaction(async (transaction) => {
      const experience = await transaction.experience.update({ where: { id }, data });
      await transaction.auditLog.create({
        data: {
          userId: actorId(request),
          action: 'UPDATE',
          entity: 'Experience',
          entityId: experience.id,
          meta: { title: experience.title },
        },
      });
      return experience;
    });
  }

  @Delete(':id')
  async delete(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const experience = await transaction.experience.findUnique({
        where: { id },
        select: { id: true, title: true },
      });
      if (!experience) throw new NotFoundException('Experience not found.');
      await transaction.experience.delete({ where: { id } });
      await transaction.auditLog.create({
        data: {
          userId: actorId(request),
          action: 'DELETE',
          entity: 'Experience',
          entityId: experience.id,
          meta: { title: experience.title },
        },
      });
      return { deleted: true };
    });
  }
}

@Controller('admin/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@ApiTags('admin profile')
export class AdminProfileController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async get(@Req() request: RequestWithUser) {
    const profile = await this.prisma.profile.findUnique({ where: { userId: actorId(request) } });
    if (!profile) throw new NotFoundException('Profile is not configured yet.');
    return profile;
  }

  @Patch()
  async patch(
    @Req() request: RequestWithUser,
    @Body(new ZodValidationPipe(ProfilePatchSchema)) body: ProfilePatchInput,
  ) {
    const userId = actorId(request);
    const current = await this.prisma.profile.findUnique({ where: { userId } });
    if (!current && (body.headline === undefined || body.bio === undefined)) {
      throw new BadRequestException('Set headline and bio when creating the initial profile.');
    }
    if (Object.keys(body).length === 0)
      throw new BadRequestException('Provide at least one profile field to update.');

    return this.prisma.$transaction(async (transaction) => {
      const profile = current
        ? await transaction.profile.update({ where: { userId }, data: body })
        : await transaction.profile.create({
            data: {
              userId,
              headline: body.headline ?? '',
              bio: body.bio ?? '',
              photoUrl: body.photoUrl ?? null,
              cvUrl: body.cvUrl ?? null,
              location: body.location ?? null,
              availability: body.availability ?? false,
              socialLinks: body.socialLinks ?? {},
            },
          });
      await transaction.auditLog.create({
        data: {
          userId,
          action: current ? 'UPDATE' : 'CREATE',
          entity: 'Profile',
          entityId: profile.id,
          meta: { fields: Object.keys(body) },
        },
      });
      return profile;
    });
  }
}
