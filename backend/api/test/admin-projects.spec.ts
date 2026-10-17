import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { describe, it } from 'node:test';
import { ProjectCreateSchema, type ProjectCreateInput } from '@portfolio/shared';
import { Role } from '../src/generated/prisma/client';
import { RequestWithUser } from '../src/auth/auth.types';
import { AdminProjectsController } from '../src/admin/admin-content.controller';
import { PrismaService } from '../src/prisma/prisma.service';

function requestAsAdmin(): RequestWithUser {
  return {
    user: { sub: randomUUID(), email: 'admin@example.com', role: Role.ADMIN },
  } as RequestWithUser;
}

function createProjectBody(overrides: Partial<ProjectCreateInput> = {}): ProjectCreateInput {
  return ProjectCreateSchema.parse({
    title: 'Portfolio Website',
    summary: 'A portfolio',
    problem: 'Problem',
    solution: 'Solution',
    result: 'Result',
    ...overrides,
  });
}

describe('AdminProjectsController', () => {
  it('generates a slug from the project title and records the mutation', async () => {
    let createdSlug = '';
    let auditAction = '';
    const transaction = {
      project: {
        create: async (args: { data: { slug: string; title: string } }) => {
          createdSlug = args.data.slug;
          return { id: randomUUID(), slug: args.data.slug, title: args.data.title };
        },
      },
      auditLog: {
        create: async (args: { data: { action: string } }) => {
          auditAction = args.data.action;
          return {};
        },
      },
    };
    const prismaMock = {
      project: { findUnique: async () => null },
      skill: { count: async () => 0 },
      media: { count: async () => 0 },
      $transaction: async <T>(callback: (tx: typeof transaction) => Promise<T>) =>
        callback(transaction),
    } as unknown as PrismaService;
    const controller = new AdminProjectsController(prismaMock);

    const result = await controller.create(requestAsAdmin(), createProjectBody());

    assert.equal(createdSlug, 'portfolio-website');
    assert.equal(auditAction, 'CREATE');
    assert.equal(result.slug, 'portfolio-website');
  });

  it('appends a suffix when the generated slug already exists', async () => {
    const lookedUpSlugs: string[] = [];
    let createdSlug = '';
    const transaction = {
      project: {
        create: async (args: { data: { slug: string; title: string } }) => {
          createdSlug = args.data.slug;
          return { id: randomUUID(), slug: args.data.slug, title: args.data.title };
        },
      },
      auditLog: { create: async () => ({}) },
    };
    const prismaMock = {
      project: {
        findUnique: async (args: { where: { slug: string } }) => {
          lookedUpSlugs.push(args.where.slug);
          return args.where.slug === 'portfolio-website' ? { id: randomUUID() } : null;
        },
      },
      skill: { count: async () => 0 },
      media: { count: async () => 0 },
      $transaction: async <T>(callback: (tx: typeof transaction) => Promise<T>) =>
        callback(transaction),
    } as unknown as PrismaService;
    const controller = new AdminProjectsController(prismaMock);

    await controller.create(requestAsAdmin(), createProjectBody());

    assert.deepEqual(lookedUpSlugs, ['portfolio-website', 'portfolio-website-2']);
    assert.equal(createdSlug, 'portfolio-website-2');
  });

  it('reorders projects with contiguous order values and writes one audit record', async () => {
    const firstId = randomUUID();
    const secondId = randomUUID();
    const reordered: Array<{ id: string; order: number }> = [];
    let auditAction = '';
    const transaction = {
      project: {
        findMany: async () => [{ id: firstId }, { id: secondId }],
        update: async (args: { where: { id: string }; data: { order: number } }) => {
          reordered.push({ id: args.where.id, order: args.data.order });
          return {};
        },
      },
      auditLog: {
        create: async (args: { data: { action: string } }) => {
          auditAction = args.data.action;
          return {};
        },
      },
    };
    const prismaMock = {
      $transaction: async <T>(callback: (tx: typeof transaction) => Promise<T>) =>
        callback(transaction),
    } as unknown as PrismaService;
    const controller = new AdminProjectsController(prismaMock);

    const result = await controller.reorder(requestAsAdmin(), { projectIds: [secondId, firstId] });

    assert.deepEqual(reordered, [
      { id: secondId, order: 0 },
      { id: firstId, order: 1 },
    ]);
    assert.equal(auditAction, 'REORDER');
    assert.deepEqual(result.projectIds, [secondId, firstId]);
  });
});
