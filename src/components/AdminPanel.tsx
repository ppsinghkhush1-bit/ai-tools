import { useState } from 'react';
import { Plus, CheckCircle, AlertCircle, Loader2, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AdminToolForm, Category, Pricing } from '../types';

const CATEGORIES: Category[] = ['Image', 'Video', 'Writing', 'Code', 'Voice', 'Productivity', 'Business', 'Automation', 'Audio', 'Research'];
const PRICINGS: Pricing[] = ['Free', 'Freemium', 'Paid'];

const defaultForm: AdminToolForm = {
  name: '',
  description: '',
  long_description: '',
  website: '',
  category: 'Writing',
  pricing: 'Free',
  logo: '',
  tags: '',
  is_featured: false,
  is_trending: false,
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function AdminPanel() {
  const [form, setForm] = useState<AdminToolForm>(defaultForm);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function update(field: keyof AdminToolForm, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.description || !form.website) {
      setErrorMsg('Name, description, and website are required.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const slug = slugify(form.name);
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);

      const { error } = await supabase.from('tools').insert({
        slug,
        name: form.name.trim(),
        description: form.description.trim(),
        long_description: form.long_description.trim() || null,
        website: form.website.trim(),
        category: form.category,
        pricing: form.pricing,
        logo: form.logo.trim() || null,
        tags,
        source: 'manual',
        upvotes: 0,
        is_featured: form.is_featured,
        is_trending: form.is_trending,
      });

      if (error) {
        if (error.code === '23505') {
          setErrorMsg('A tool with this name already exists.');
        } else {
          setErrorMsg(error.message);
        }
        setStatus('error');
      } else {
        setStatus('success');
        setForm(defaultForm);
      }
    } catch {
      setErrorMsg('An unexpected error occurred.');
      setStatus('error');
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all duration-200 text-sm";
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00b4ff, #a855f7)' }}>
            <Upload className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Submit AI Tool</h1>
        </div>
        <p className="text-gray-500 text-sm">Add a new AI tool to the NexusAI directory</p>
      </div>

      {status === 'success' && (
        <div className="flex items-center gap-3 p-4 rounded-2xl mb-6 animate-fade-in"
          style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <div className="text-green-400 font-medium text-sm">Tool submitted successfully!</div>
            <div className="text-green-600 text-xs mt-0.5">It will appear in the directory shortly.</div>
          </div>
        </div>
      )}

      {status === 'error' && errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl mb-6 animate-fade-in"
          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-3xl p-6 space-y-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Basic Info</h3>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Tool Name *</label>
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
              placeholder="e.g., ChatGPT" className={inputClass} style={inputStyle} required />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Website URL *</label>
            <input type="url" value={form.website} onChange={e => update('website', e.target.value)}
              placeholder="https://example.com" className={inputClass} style={inputStyle} required />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Short Description *</label>
            <input type="text" value={form.description} onChange={e => update('description', e.target.value)}
              placeholder="Brief description (1-2 sentences)" className={inputClass} style={inputStyle} required />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Description</label>
            <textarea value={form.long_description} onChange={e => update('long_description', e.target.value)}
              placeholder="Detailed description of features and use cases..."
              rows={4} className={`${inputClass} resize-none`} style={inputStyle} />
          </div>
        </div>

        <div className="rounded-3xl p-6 space-y-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Classification</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Category *</label>
              <select value={form.category} onChange={e => update('category', e.target.value as Category)}
                className={inputClass} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0f0f24' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Pricing *</label>
              <select value={form.pricing} onChange={e => update('pricing', e.target.value as Pricing)}
                className={inputClass} style={inputStyle}>
                {PRICINGS.map(p => <option key={p} value={p} style={{ background: '#0f0f24' }}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Logo URL</label>
            <input type="url" value={form.logo} onChange={e => update('logo', e.target.value)}
              placeholder="https://example.com/logo.png" className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={e => update('tags', e.target.value)}
              placeholder="ai, assistant, writing, gpt" className={inputClass} style={inputStyle} />
          </div>
        </div>

        <div className="rounded-3xl p-6 space-y-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Flags</h3>
          <div className="flex gap-6">
            {[
              { field: 'is_featured' as const, label: 'Featured' },
              { field: 'is_trending' as const, label: 'Trending' },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2.5 cursor-pointer">
                <div
                  onClick={() => update(field, !form[field])}
                  className={`w-10 h-6 rounded-full transition-all duration-200 relative cursor-pointer ${
                    form[field] ? '' : 'bg-white/10'
                  }`}
                  style={form[field] ? { background: 'linear-gradient(135deg, #00b4ff, #a855f7)' } : {}}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                    form[field] ? 'left-5' : 'left-1'
                  }`} />
                </div>
                <span className="text-sm text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full btn-primary text-white py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-semibold"
        >
          {status === 'loading' ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
          ) : (
            <><Plus className="w-5 h-5" /> Submit Tool</>
          )}
        </button>
      </form>
    </div>
  );
}
