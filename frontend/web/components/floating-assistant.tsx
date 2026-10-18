'use client';

import { ArrowUp, Bot, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { apiPost } from '../app/lib/api';

const topics = [
  {
    id: 'about',
    idLabel: 'Tentang Rafi',
    enLabel: 'About Rafi',
    keys: ['tentang', 'about', 'rafi'],
  },
  {
    id: 'experience',
    idLabel: 'Pengalaman',
    enLabel: 'Experience',
    keys: ['pengalaman', 'experience', 'work', 'kerja'],
  },
  { id: 'services', idLabel: 'Layanan', enLabel: 'Services', keys: ['layanan', 'service', 'jasa'] },
  {
    id: 'projects',
    idLabel: 'Proyek',
    enLabel: 'Projects',
    keys: ['proyek', 'project', 'portfolio'],
  },
  {
    id: 'awards',
    idLabel: 'Sertifikat',
    enLabel: 'Certificates',
    keys: ['sertifikat', 'certificate', 'award', 'penghargaan'],
  },
  {
    id: 'contact',
    idLabel: 'Kontak',
    enLabel: 'Contact',
    keys: ['kontak', 'contact', 'hubungi', 'email'],
  },
];

export type AssistantReference = {
  title: string;
  content: string;
  href: string;
};

const categoryOf = (reference: AssistantReference) => {
  const value = reference.content.toLowerCase();
  if (/^(tentang saya profil|about profile)/.test(value)) return 'profile';
  if (/^(pengalaman kerja|work experience)/.test(value)) return 'experience';
  if (/^(tools keahlian|tools skills)/.test(value)) return 'skill';
  if (/^(proyek|projects)/.test(value)) return 'project';
  if (/^(layanan|services)/.test(value)) return 'service';
  if (/^(sertifikat penghargaan|certificates awards)/.test(value)) return 'certificate';
  if (/^(artikel blog|blog article)/.test(value)) return 'blog';
  if (/^(kontak dan media sosial|contact and social links)/.test(value)) return 'contact';
  return 'other';
};

function AssistantMessageContent({ content }: { content: string }) {
  const blocks = content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  return (
    <div className="assistant-message-content">
      {blocks.map((block, index) => {
        const lines = block
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
        if (lines.length && lines.every((line) => /^[-*]\s+/.test(line))) {
          return (
            <ul key={index}>
              {lines.map((line, itemIndex) => (
                <li key={itemIndex}>{line.replace(/^[-*]\s+/, '')}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{block}</p>;
      })}
    </div>
  );
}

function localPortfolioReply(
  question: string,
  locale: 'id' | 'en',
  references: AssistantReference[],
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
) {
  const text = question.toLowerCase();
  const previousQuestion =
    [...history]
      .reverse()
      .find((item) => item.role === 'user')
      ?.content.toLowerCase() ?? '';
  const isFollowUp =
    question.trim().length < 42 &&
    /(itu|tersebut|detail|lanjut|lainnya|lagi|di sana|di situ|yang tadi|more|that one|there|it\b|else|another)/i.test(
      text,
    );
  const topicText = isFollowUp ? `${text} ${previousQuestion}` : text;
  const indonesianWords =
    /\b(apa|siapa|kenapa|mengapa|bagaimana|gimana|kapan|dimana|mana|berapa|yang|dan|dengan|untuk|saya|aku|kamu|kita|bisa|tolong|dong|sih|nih|kok|banget|enggak|nggak|gak|ga|ada|punya|mau|ingin|jadi|tentang|terbaru|terakhir|pengalaman|kerja|proyek|layanan|keahlian|sertifikat|penghargaan|kontak|artikel|hai|halo|hidup+)\b/i;
  const englishWords =
    /\b(what|who|where|when|why|how|the|and|with|about|tell|show|latest|experience|work|skills|skill|projects|project|services|service|contact|tools|certificate|awards|blog)\b/i;
  const indonesian =
    indonesianWords.test(text) ||
    /\b\w+nya\b|\b(ng|ny|ku|mu)\b/i.test(text) ||
    (locale === 'id' && !englishWords.test(text));
  const say = (id: string, en: string) => (indonesian ? id : en);
  const bullets = (
    idIntro: string,
    enIntro: string,
    items: AssistantReference[],
    idOutro?: string,
    enOutro?: string,
  ) => {
    const selected = items.slice(0, 8);
    return `${say(idIntro, enIntro)}${selected.length ? `\n\n${selected.map((item) => `- ${item.title.split(/\s+[â€”â€“-]\s+/)[0]}`).join('\n')}` : ''}${idOutro || enOutro ? `\n\n${say(idOutro ?? '', enOutro ?? '')}` : ''}`;
  };
  const grouped = references.reduce<Record<string, AssistantReference[]>>((items, reference) => {
    const category = categoryOf(reference);
    (items[category] ??= []).push(reference);
    return items;
  }, {});
  const projects = grouped.project ?? [];
  const experiences = grouped.experience ?? [];
  const skills = grouped.skill ?? [];
  const services = grouped.service ?? [];
  const certificates = grouped.certificate ?? [];
  const profile = grouped.profile?.[0];
  const latestProjects = [...projects].sort((a, b) => {
    const dateA = a.content.match(/(?:dibuat|created)\s+(\d{4}-\d{2}-\d{2})/i)?.[1] ?? '';
    const dateB = b.content.match(/(?:dibuat|created)\s+(\d{4}-\d{2}-\d{2})/i)?.[1] ?? '';
    return dateB.localeCompare(dateA);
  });
  const shortList = (items: AssistantReference[], limit = 4) =>
    items
      .slice(0, limit)
      .map((item) => item.title.split(/\s+[—–-]\s+/)[0])
      .join(', ');
  const projectDescription = (item: AssistantReference) =>
    item.content
      .match(
        /(?:deskripsi|description)\s*[:;]?\s*(.+?)(?:;|\s+(?:klien|client|dibuat|created)\s+)/i,
      )?.[1]
      ?.trim();
  const cleanProfile = profile?.content
    .replace(/^(tentang saya profil|about profile)\s*/i, '')
    .trim();

  if (/^(hai|halo|hello|hi|hey)\b/i.test(text)) {
    return say(
      'Hai! Mau tahu apa tentang Rafi? Aku bisa cerita soal keahlian, pengalaman, proyek, atau layanannya.',
      'Hey! What would you like to know about Rafi? I can tell you about his skills, experience, projects, or services.',
    );
  }
  if (/\bhidup+\s+\w+/i.test(text) || /\b(wkwk|hahaha|lol|lmao)\b/i.test(text)) {
    return say(
      'Wkwk, semangatnya sampai sini 😄 Kalau mau, aku juga bisa bantu cerita soal proyek, pengalaman, atau keahlian Rafi.',
      'Haha, I can feel the energy 😄 If you like, I can also tell you about Rafi’s projects, experience, or skills.',
    );
  }
  if (
    /(terbaru|terakhir|latest|recent|paling baru)/i.test(topicText) &&
    /(proyek|project|karya|portfolio)/i.test(topicText)
  ) {
    const latest = latestProjects[0];
    if (!latest)
      return say(
        'Belum ada proyek yang ditampilkan di portfolio saat ini.',
        'There are no projects listed in the portfolio yet.',
      );
    const description = projectDescription(latest);
    const date = latest.content.match(/(?:dibuat|created)\s+(\d{4}-\d{2}-\d{2})/i)?.[1];
    return say(
      `Proyek terbaru yang tercatat adalah ${latest.title}${date ? `, dibuat ${date}` : ''}.${description ? ` ${description}.` : ''} Mau tahu detail proyek lainnya juga?`,
      `The latest project listed is ${latest.title}${date ? `, created ${date}` : ''}.${description ? ` ${description}.` : ''} Want to hear about another project too?`,
    );
  }
  if (/(siapa|tentang|about|who is|profil|profile|rafi)/i.test(topicText)) {
    const role = cleanProfile?.match(/(?:peran|role)\s+([^;]+)/i)?.[1]?.trim();
    const intro = role
      ? say(`Rafi Budiansyah adalah ${role}.`, `Rafi Budiansyah is ${role}.`)
      : say(
          'Rafi Budiansyah adalah pemilik portfolio ini.',
          'Rafi Budiansyah is the person behind this portfolio.',
        );
    const bio = cleanProfile?.match(
      /(?:bio|ringkasan)\s*[:;]\s*(.+?)(?:\s*;\s*(?:lokasi|location)\s*[:;]|$)/i,
    )?.[1];
    const parts = [intro];
    if (bio) parts.push(bio.replace(/[.\s]+$/, '.'));
    const details = [
      ...(skills.length
        ? [
            say(
              `Keahlian utama yang tercatat: ${shortList(skills, 5)}.`,
              `His listed skills include ${shortList(skills, 5)}.`,
            ),
          ]
        : []),
      ...(experiences.length
        ? [
            say(
              `Pengalaman: ${shortList(experiences, 3)}.`,
              `Experience: ${shortList(experiences, 3)}.`,
            ),
          ]
        : []),
      ...(projects.length
        ? [
            say(
              `Proyek: ${shortList(latestProjects, 3)}.`,
              `Projects: ${shortList(latestProjects, 3)}.`,
            ),
          ]
        : []),
    ];
    if (details.length) parts.push(details.map((item) => `- ${item}`).join('\n'));
    return parts.join('\n\n');
  }
  if (/(keahlian|skill|tools?|teknologi|technology)/i.test(topicText)) {
    return skills.length
      ? bullets(
          'Ini keahlian dan tools yang tercatat di portfolio Rafi:',
          'These are the skills and tools listed in Rafi’s portfolio:',
          skills,
          'Ada yang ingin kamu tanyakan lebih spesifik?',
          'Want to know more about any of them?',
        )
      : say(
          'Data keahlian belum ditambahkan ke portfolio.',
          'No skills have been added to the portfolio yet.',
        );
  }
  if (/(pengalaman|experience|riwayat kerja|work history|pekerjaan)/i.test(topicText)) {
    return experiences.length
      ? bullets(
          'Ini pengalaman yang tercatat:',
          'Here is the experience listed:',
          experiences,
          'Mau tahu lebih banyak tentang salah satunya?',
          'Would you like to know more about one of them?',
        )
      : say(
          'Belum ada pengalaman yang ditampilkan di portfolio.',
          'There is no experience listed in the portfolio yet.',
        );
  }
  if (/(layanan|jasa|service|offer)/i.test(topicText)) {
    return services.length
      ? bullets(
          'Layanan yang ditawarkan Rafi:',
          'Services listed in Rafi’s portfolio:',
          services,
          'Kamu tertarik dengan layanan yang mana?',
          'Which service are you interested in?',
        )
      : say(
          'Informasi layanan belum tersedia di portfolio.',
          'Service information is not available in the portfolio yet.',
        );
  }
  if (/(sertifikat|certificate|penghargaan|award)/i.test(topicText)) {
    return certificates.length
      ? bullets(
          'Sertifikat dan penghargaan yang tercatat:',
          'Certificates and awards listed:',
          certificates,
        )
      : say(
          'Belum ada sertifikat atau penghargaan yang ditampilkan.',
          'There are no certificates or awards listed yet.',
        );
  }
  if (/(kontak|contact|hubungi|email|whatsapp|sosial|social)/i.test(topicText)) {
    const contact = grouped.contact?.[0]?.content
      .replace(/^(kontak dan media sosial|contact and social links)\s*/i, '')
      .trim();
    return contact
      ? say(`Kamu bisa menghubungi Rafi lewat: ${contact}.`, `You can reach Rafi via: ${contact}.`)
      : say(
          'Info kontak belum dicantumkan di portfolio.',
          'Contact details are not listed in the portfolio yet.',
        );
  }
  if (/(blog|artikel|article|tulisan)/i.test(topicText)) {
    const blogs = grouped.blog ?? [];
    return blogs.length
      ? bullets('Artikel yang tersedia:', 'Articles listed:', blogs.slice(0, 6))
      : say('Belum ada artikel blog yang ditampilkan.', 'There are no blog articles listed yet.');
  }
  if (/(proyek|project|karya|portfolio)/i.test(topicText)) {
    return projects.length
      ? bullets(
          'Beberapa proyek yang tercatat:',
          'Some projects listed:',
          latestProjects.slice(0, 6),
          'Sebut nama proyeknya kalau kamu ingin tahu ringkasannya.',
          'Name a project if you’d like a quick summary.',
        )
      : say(
          'Belum ada proyek yang ditampilkan di portfolio.',
          'There are no projects listed in the portfolio yet.',
        );
  }

  const stopWords = new Set([
    'apa',
    'siapa',
    'yang',
    'dan',
    'dengan',
    'untuk',
    'dari',
    'tentang',
    'tolong',
    'dong',
    'saya',
    'aku',
    'kamu',
    'bisa',
    'the',
    'and',
    'for',
    'from',
    'about',
    'what',
    'who',
    'how',
    'please',
    'tell',
    'show',
    'me',
    'rafi',
  ]);
  const words = text
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 2 && !stopWords.has(word));
  const match = references
    .map((item) => ({
      item,
      score: words.reduce(
        (score, word) =>
          score +
          (item.title.toLowerCase().includes(word) ? 3 : 0) +
          (item.content.toLowerCase().includes(word) ? 1 : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score)[0];
  if (match && match.score >= 3) {
    return say(
      `Oh, ${match.item.title} ya. ${projectDescription(match.item) ?? match.item.content.replace(/^(tentang saya profil|about profile|pengalaman kerja|work experience|tools keahlian|tools skills|proyek|projects|layanan|services|sertifikat penghargaan|certificates awards|artikel blog|blog article)\s*/i, '')} Mau tahu bagian lainnya?`,
      `Oh, ${match.item.title}. ${projectDescription(match.item) ?? match.item.content} Want to know anything else?`,
    );
  }
  return say(
    'Aku belum menangkap maksud pertanyaannya. Coba tanya dengan lebih jelas, misalnya: “Apa keahlian utama Rafi?”, “Apa proyek terbarunya?”, atau “Apa pengalaman kerjanya?”',
    'I’m not sure what you mean. Try a clearer question, such as “What are Rafi’s main skills?”, “What’s his latest project?”, or “What experience does he have?”',
  );
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M20.2 11.8a8.2 8.2 0 0 1-12.1 7.2L3.3 20l1-4.6a8.2 8.2 0 1 1 15.9-3.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8.1 7.6c-.3.4-.7.9-.7 1.7 0 1.6 1.4 3.5 1.7 3.8.2.3 2.3 2.5 4.7 3 .8.2 1.4-.1 1.8-.4.3-.3.5-1 .6-1.3.1-.2 0-.4-.2-.5l-1.9-.9c-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1-.7-.3-1.5-.8-2.1-1.4-.6-.5-1-1.2-1.2-1.5-.1-.2 0-.3.1-.4l.6-.7c.1-.2.2-.4.1-.5l-.8-2c-.1-.2-.3-.3-.9-.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function FloatingAssistant({
  locale,
  whatsappUrl,
  references,
}: {
  locale: 'id' | 'en';
  whatsappUrl?: string;
  references: AssistantReference[];
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>(
    [],
  );
  const [busy, setBusy] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [greeting, setGreeting] = useState(
    locale === 'id'
      ? 'Halo! Aku bisa bantu cari tahu tentang Rafi. Mau ngobrol soal apa?'
      : 'Hey! I can tell you about Rafi. What would you like to know?',
  );

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 380);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    const pane = messagesRef.current;
    if (pane) pane.scrollTo({ top: pane.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    if (locale === 'id')
      setGreeting('Halo! Aku bisa bantu cari tahu tentang Rafi. Mau ngobrol soal apa?');
    else setGreeting('Hey! I can tell you about Rafi. What would you like to know?');
  }, [locale]);

  const sendQuestion = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || busy) return;
    const history = messages.slice(-8);
    setMessages((items) => [...items, { role: 'user', content: text }]);
    setQuestion('');
    setBusy(true);
    try {
      const result = await apiPost<{ answer: string }>('/assistant/chat', {
        message: text,
        locale,
        context: references.slice(0, 100).map(({ title, content }) => ({
          title: title.slice(0, 160),
          content: content.slice(0, 2000),
        })),
        history,
      });
      setMessages((items) => [...items, { role: 'assistant', content: result.answer }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      const inIndonesian =
        locale === 'id' ||
        /\b(apa|siapa|gimana|saya|aku|kamu|yang|terbaru|proyek|layanan|kerja|hidup+)\b/i.test(text);
      let reply: string;
      if (errorMessage.includes('CLOUDFLARE_ACCOUNT_ID')) {
        reply = inIndonesian
          ? 'AI online belum disambungkan. Tambahkan Account ID dan API Token Cloudflare ke backend/api/.env, lalu restart API. Untuk sementara, aku jawab dari data portfolio dulu ya.\n\n'
          : 'The online AI is not connected yet. Add your Cloudflare Account ID and API Token to backend/api/.env, then restart the API. For now, I’ll answer from the portfolio data.\n\n';
      } else if (errorMessage.includes('Kuota gratis AI')) {
        reply = inIndonesian
          ? 'Kuota AI gratis hari ini sudah habis, jadi aku bantu pakai info portfolio yang ada dulu ya.\n\n'
          : 'Today’s free AI quota is used up, so I’ll help using the portfolio information for now.\n\n';
      } else if (errorMessage.includes('Cloudflare AI menolak')) {
        reply = inIndonesian
          ? 'AI online belum bisa diakses. Cek token dan izinnya; sementara itu, aku jawab dari data portfolio dulu ya.\n\n'
          : 'The online AI is not available. Check the token and its permissions; meanwhile, I’ll use the portfolio data.\n\n';
      } else {
        reply = inIndonesian
          ? 'AI online sedang sulit dijangkau, jadi aku jawab dari data portfolio dulu ya.\n\n'
          : 'The online AI is temporarily unreachable, so I’ll use the portfolio data for now.\n\n';
      }
      const fallback = localPortfolioReply(text, locale, references, history);
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      setMessages((items) => [...items, { role: 'assistant', content: `${reply}${fallback}` }]);
    } finally {
      setBusy(false);
    }
  };

  const ask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendQuestion(question);
  };

  return (
    <div className="floating-assistant">
      {open && (
        <section
          className="assistant-panel"
          aria-label={locale === 'id' ? 'Asisten portfolio' : 'Portfolio assistant'}
        >
          <header className="assistant-panel-header">
            <span className="assistant-avatar">
              <Bot size={17} aria-hidden="true" />
            </span>
            <span>
              <strong>AI Assistant</strong>
              <small>
                {locale === 'id' ? 'Asisten portfolio Rafi' : 'Rafi’s portfolio assistant'}
              </small>
            </span>
            <button
              type="button"
              className="assistant-close"
              onClick={() => setOpen(false)}
              aria-label={locale === 'id' ? 'Tutup' : 'Close'}
            >
              <X size={17} />
            </button>
          </header>
          <div
            className="assistant-messages"
            aria-live="polite"
            ref={messagesRef}
            data-lenis-prevent-wheel
          >
            <p className="assistant-message">{greeting}</p>
            {messages.map((item, index) => (
              <div
                className={`assistant-message${item.role === 'user' ? ' assistant-message-answer' : ''}`}
                key={`${item.role}-${index}`}
              >
                {item.role === 'assistant' ? (
                  <AssistantMessageContent content={item.content} />
                ) : (
                  item.content
                )}
              </div>
            ))}
            {busy && (
              <p className="assistant-message assistant-typing">
                {locale === 'id' ? 'Sedang mengetik…' : 'Typing…'}
              </p>
            )}
          </div>
          <div className="assistant-suggestions">
            {topics.slice(2, 5).map((topic) => (
              <button
                type="button"
                key={topic.id}
                disabled={busy}
                onClick={() => void sendQuestion(locale === 'id' ? topic.idLabel : topic.enLabel)}
              >
                {locale === 'id' ? topic.idLabel : topic.enLabel}
              </button>
            ))}
          </div>
          <form className="assistant-input" onSubmit={(event) => void ask(event)}>
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={locale === 'id' ? 'Tanyakan sesuatu…' : 'Ask something…'}
              aria-label={locale === 'id' ? 'Tanyakan sesuatu' : 'Ask something'}
            />
            <button
              type="submit"
              disabled={busy || !question.trim()}
              aria-label={locale === 'id' ? 'Kirim pertanyaan' : 'Send question'}
            >
              <Send size={15} />
            </button>
          </form>
        </section>
      )}

      <div className={`floating-assistant-actions${open ? ' is-hidden' : ''}`}>
        {!open && scrolled && (
          <button
            type="button"
            className="floating-action floating-back-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label={locale === 'id' ? 'Kembali ke atas' : 'Back to top'}
            title={locale === 'id' ? 'Kembali ke atas' : 'Back to top'}
          >
            <ArrowUp size={19} />
          </button>
        )}
        {!open && whatsappUrl && (
          <a
            className="floating-action floating-whatsapp"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            aria-label="WhatsApp"
            title="WhatsApp"
          >
            <WhatsAppGlyph />
          </a>
        )}
        <button
          type="button"
          className={`floating-action floating-assistant-toggle${open ? ' is-open' : ''}`}
          onClick={() => setOpen((value) => !value)}
          aria-label={locale === 'id' ? 'Buka AI Assistant' : 'Open AI Assistant'}
          aria-expanded={open}
          title="AI Assistant"
        >
          {open ? <X size={20} /> : <MessageCircle size={20} />}
          {!open && <span className="assistant-status-dot" />}
        </button>
      </div>
    </div>
  );
}
