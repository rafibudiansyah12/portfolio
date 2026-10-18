import {
  BadGatewayException,
  Body,
  Controller,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import { ZodValidationPipe } from '../auth/auth.validation.pipe';

const ChatInputSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  locale: z.enum(['id', 'en']),
  context: z
    .array(z.object({ title: z.string().max(160), content: z.string().max(2000) }))
    .max(100),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(2000) }))
    .max(12),
});
type ChatInput = z.infer<typeof ChatInputSchema>;

@Controller('assistant')
export class AssistantController {
  @Post('chat')
  @Throttle({ default: { limit: 12, ttl: 60_000 } })
  async chat(@Body(new ZodValidationPipe(ChatInputSchema)) body: ChatInput) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    if (!accountId || !apiToken) {
      throw new ServiceUnavailableException(
        'Asisten online belum dikonfigurasi. Tambahkan CLOUDFLARE_ACCOUNT_ID dan CLOUDFLARE_API_TOKEN pada environment backend.',
      );
    }

    const portfolio = body.context
      .map(({ title, content }) => `## ${title}\n${content}`)
      .join('\n\n')
      .slice(0, 24_000);
    const systemMessage = `Kamu asisten chat portfolio Rafi yang ramah dan santai, bukan Rafi. Jawab langsung pesan TERAKHIR pengguna dalam bahasa yang sama dengan pesannya. Jika pertanyaan berbahasa Indonesia, jawab seluruhnya dalam bahasa Indonesia; jika Inggris, jawab dalam bahasa Inggris. Jangan menyapa ulang, jangan bilang "siap membantu", dan jangan menjelaskan siapa dirimu.

Jawab pertanyaan portfolio hanya dengan fakta relevan dari data di bawah; jangan mengarang. Untuk pertanyaan "siapa Rafi", rangkum peran, keahlian, pengalaman, dan beberapa proyek yang memang tersedia. Untuk proyek terbaru, gunakan tanggal dibuat paling baru. Kalau jawaban memuat beberapa informasi, awali dengan satu paragraf pendek lalu susun rincian sebagai daftar bullet (baris diawali -); kelompokkan poin yang serupa, pilih 2–5 poin yang paling relevan, lalu tutup dengan satu kalimat tindak lanjut bila terasa alami. Untuk pertanyaan sederhana, cukup jawab satu paragraf singkat. Jangan keluarkan teks Markdown tebal atau judul yang tidak perlu.

Jika pengguna mengirim pesan ngawur, cuma nama/topik acak, atau topik yang tidak terkait portfolio, jangan berpura-pura tahu maksudnya dan jangan mengarang fakta. Balas santai dalam satu atau dua kalimat: untuk candaan/frasa "Hidup Jokiwiii", tanggapi candaan itu; untuk lainnya, minta pengguna bertanya dengan jelas dan tawarkan contoh pertanyaan yang masuk akal tentang Rafi, seperti keahlian utama, pengalaman, proyek terbaru, layanan, atau kontaknya. Jangan alihkan mereka ke bagian/tautan situs; tanggapi lewat chat.

DATA PORTFOLIO:
${portfolio}`;
    const messages = [
      { role: 'system', content: systemMessage },
      ...body.history.map(({ role, content }) => ({ role, content })),
      { role: 'user', content: body.message },
    ];

    let response: Response;
    try {
      response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/@cf/aisingapore/gemma-sea-lion-v4-27b-it`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages, max_tokens: 500, temperature: 0.65 }),
          signal: AbortSignal.timeout(25_000),
        },
      );
    } catch {
      throw new BadGatewayException(
        'Layanan AI online sedang tidak dapat dijangkau. Coba lagi sebentar.',
      );
    }

    if (response.status === 429) {
      throw new BadGatewayException(
        'Kuota gratis AI hari ini sedang habis. Coba lagi setelah kuota direset.',
      );
    }
    if (!response.ok) {
      throw new BadGatewayException(
        'Cloudflare AI menolak permintaan. Periksa Account ID, API Token, dan izin Workers AI.',
      );
    }
    const payload = (await response.json()) as {
      success?: boolean;
      result?: {
        response?: string;
        choices?: Array<{ message?: { content?: string } }>;
      };
    };
    const answer = (
      payload.result?.response ?? payload.result?.choices?.[0]?.message?.content
    )?.trim();
    if (!payload.success || !answer) {
      throw new BadGatewayException(
        'AI online belum menghasilkan jawaban. Coba tanyakan lagi dengan kalimat berbeda.',
      );
    }
    return {
      answer: answer
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/^\s*[-*]\s+/gm, '- ')
        .trim(),
    };
  }
}
