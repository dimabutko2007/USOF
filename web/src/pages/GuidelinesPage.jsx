import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  MessageSquare,
  ThumbsUp,
  Tag,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

const GuidelinesPage = () => {
  const rules = [
    {
      title: 'Be Respectful & Civil',
      icon: <ShieldCheck size={22} color="var(--accent-primary)" />,
      badge: 'Golden Rule',
      description:
        'Treat every developer with empathy and professionalism. Technical disagreements are normal, but personal insults, harassment, hate speech, and condescending language will result in account suspension.',
      points: [
        'Welcome beginners and constructive questions with patience.',
        'Focus on the code and technical problem, never on the person.',
        'Use polite, inclusive, and professional phrasing.',
      ],
    },
    {
      title: 'No Spam, Ads, or Self-Promotion',
      icon: <AlertTriangle size={22} color="var(--color-warning)" />,
      badge: 'Zero Tolerance',
      description:
        'USOF is built for authentic engineering problem-solving. Posts or comments designed strictly to sell services, promote affiliate links, or mass-generate low-effort content are promptly removed.',
      points: [
        'Do not post unsolicited product advertisements or affiliate links.',
        'Avoid duplicate posts or repetitive comments across threads.',
        'Do not deploy automated bots or scrapers to publish content.',
      ],
    },
    {
      title: 'Write Clear & Well-Formed Questions',
      icon: <MessageSquare size={22} color="var(--color-success)" />,
      badge: 'Best Practice',
      description:
        'Help others help you. A well-crafted question receives faster, more accurate answers and serves as a valuable resource for future developers.',
      points: [
        'Provide a clear, descriptive title outlining your exact issue.',
        'Include minimal reproducible code snippets and error logs.',
        'State what solutions you have already tried and what you expected.',
      ],
    },
    {
      title: 'Categorize & Tag Appropriately',
      icon: <Tag size={22} color="var(--accent-primary)" />,
      badge: 'Organization',
      description:
        'Apply relevant technology categories (such as JavaScript, Node.js, React, Docker, or MySQL) to your posts so domain specialists can discover and answer them.',
      points: [
        'Select up to the most relevant categories per discussion.',
        'Do not misuse popular tags to artificially boost visibility.',
        'Browse existing category feeds to check if your issue was solved.',
      ],
    },
    {
      title: 'Vote Constructively & Objectively',
      icon: <ThumbsUp size={22} color="var(--color-success)" />,
      badge: 'Reputation',
      description:
        'Votes drive developer reputation on USOF. Use upvotes to reward high-quality, verified solutions, and downvotes to signal inaccurate or unsafe practices.',
      points: [
        'Upvote answers that directly solve the problem or add insight.',
        'Downvote only when information is factually incorrect or hazardous.',
        'Leave a brief clarifying comment if you downvote an answer.',
      ],
    },
  ];

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '2rem' }}>
      {/* Header Banner */}
      <div
        className="card fade-in"
        style={{
          marginBottom: '1.5rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
          borderLeft: '4px solid var(--accent-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.65rem' }}>
          <div
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-light, rgba(99, 102, 241, 0.12))',
              display: 'inline-flex',
            }}
          >
            <Sparkles size={26} color="var(--accent-primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 700, margin: 0 }}>Community Guidelines</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
              Standards for a constructive, welcoming, and high-signal developer platform.
            </p>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {rules.map((rule, idx) => (
          <div key={idx} className="card fade-in" style={{ padding: '1.4rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {rule.icon}
                <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>
                  {idx + 1}. {rule.title}
                </h2>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                {rule.badge}
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.85rem' }}>
              {rule.description}
            </p>

            <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {rule.points.map((pt, pIdx) => (
                <li
                  key={pIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  <CheckCircle2 size={16} color="var(--color-success)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </Link>
        <Link to="/privacy" className="btn btn-outline btn-sm">
          <span>Read Privacy Policy →</span>
        </Link>
      </div>
    </div>
  );
};

export default GuidelinesPage;

