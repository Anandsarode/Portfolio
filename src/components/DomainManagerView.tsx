import React, { useState } from 'react';
import {
  Globe,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  Lock,
  Server,
} from 'lucide-react';
import type { CustomDomainRecord, RedirectRule } from '../types';

interface DomainManagerViewProps {
  domains: CustomDomainRecord[];
  redirects: RedirectRule[];
  onAddDomain: (domainName: string) => Promise<void>;
  onVerifyDomain: (id: string) => Promise<void>;
  onSetPrimaryDomain: (id: string) => Promise<void>;
  onDeleteDomain: (id: string) => Promise<void>;
  onUpdateRedirects: (nextRedirects: RedirectRule[]) => Promise<void>;
}

export const DomainManagerView: React.FC<DomainManagerViewProps> = ({
  domains,
  redirects,
  onAddDomain,
  onVerifyDomain,
  onSetPrimaryDomain,
  onDeleteDomain,
  onUpdateRedirects,
}) => {
  const [newDomainInput, setNewDomainInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Redirect Rule Form State
  const [sourcePath, setSourcePath] = useState('/press-kit');
  const [destinationUrl, setDestinationUrl] = useState('https://en.wikipedia.org/wiki/Architecture');
  const [statusCode, setStatusCode] = useState<301 | 302>(301);

  const copyValue = (key: string, val: string) => {
    navigator.clipboard?.writeText(val).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleCreateDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput.trim()) return;
    setErrorMsg(null);
    setIsAdding(true);
    try {
      await onAddDomain(newDomainInput.trim());
      setNewDomainInput('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to register domain.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      await onVerifyDomain(id);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleAddRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourcePath.trim() || !destinationUrl.trim()) return;
    const cleanSource = sourcePath.trim().startsWith('/')
      ? sourcePath.trim()
      : `/${sourcePath.trim()}`;
    const cleanDest = /^https?:\/\//i.test(destinationUrl.trim())
      ? destinationUrl.trim()
      : `https://${destinationUrl.trim()}`;

    const newRule: RedirectRule = {
      id: `red-${Date.now()}`,
      sourcePath: cleanSource,
      destinationUrl: cleanDest,
      statusCode,
      preserveQuery: true,
      enabled: true,
      hits: 0,
    };

    await onUpdateRedirects([newRule, ...redirects]);
    setSourcePath('');
    setDestinationUrl('');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E6E1DA] dark:border-[#26262B]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6E6A63] dark:text-[#9E988E] mb-1">
            <span>Custom Domain Infrastructure</span>
            <span aria-hidden="true">·</span>
            <span>Live DNS & X.509 SSL Inspector</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{domains.length} Connected Domains</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#181615] dark:text-[#F4F1EA]">
            Custom Domains, SSL & Redirect Rules
          </h1>
        </div>

        {/* Connect New Domain Form */}
        <form onSubmit={handleCreateDomain} className="flex items-center gap-2.5">
          <input
            type="text"
            value={newDomainInput}
            onChange={(e) => setNewDomainInput(e.target.value)}
            placeholder="Enter domain (e.g. studio.yourdomain.com)"
            className="w-64 sm:w-80 px-3.5 py-2 text-xs font-mono rounded-lg border border-[#D8D2C9] dark:border-[#323238] bg-white dark:bg-[#16161A] text-[#181615] dark:text-[#F4F1EA]"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="px-4 py-2 text-xs font-medium bg-[#181615] dark:bg-[#F4F1EA] text-[#FAF8F5] dark:text-[#0C0C0E] rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Querying DNS...' : 'Connect Domain'}</span>
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl border border-[#B91C1C]/40 bg-[#B91C1C]/5 text-xs text-[#B91C1C]">
          {errorMsg}
        </div>
      )}

      {/* Connected Domains List */}
      <div className="space-y-6">
        {domains.map((dom) => {
          const isChecking = verifyingId === dom.id;

          return (
            <div
              key={dom.id}
              className="border border-[#E6E1DA] dark:border-[#26262B] bg-white dark:bg-[#16161A] rounded-xl p-6 space-y-6"
            >
              {/* Top Domain Summary Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#EFECE6] dark:border-[#222228]">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Globe className="w-5 h-5 text-[#181615] dark:text-[#F4F1EA]" />
                    <h2 className="font-mono text-lg sm:text-xl font-semibold text-[#181615] dark:text-[#F4F1EA]">
                      {dom.domain}
                    </h2>
                    <span aria-hidden="true" className="text-[#6E6A63]">·</span>
                    <span className="text-xs font-medium text-[#181615] dark:text-[#F4F1EA]">
                      {dom.isPrimary ? 'Primary Canonical Domain' : 'Secondary Alias'}
                    </span>
                  </div>

                  {/* Unboxed Status Metadata */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#6E6A63] dark:text-[#9E988E]">
                    <span className="flex items-center gap-1">
                      {dom.dnsStatus === 'verified' ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-[#B45309]" />
                      )}
                      <span
                        className={
                          dom.dnsStatus === 'verified'
                            ? 'text-[#15803D] font-medium'
                            : 'text-[#B45309] font-medium'
                        }
                      >
                        {dom.dnsStatus === 'verified'
                          ? 'Public DNS Resolved'
                          : 'Awaiting Registrar DNS Propagation'}
                      </span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>
                        SSL Status:{' '}
                        {dom.sslStatus === 'active'
                          ? `Active (${dom.sslProtocol || 'TLSv1.3'})`
                          : dom.sslStatus === 'expired'
                          ? 'Certificate Expired'
                          : 'No Active TLS Certificate'}
                      </span>
                    </span>
                    {dom.dnsLookupLatencyMs !== null && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Lookup Latency: {dom.dnsLookupLatencyMs}ms
                        </span>
                      </>
                    )}
                    {dom.lastCheckedAt && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Verified {new Date(dom.lastCheckedAt).toLocaleTimeString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {!dom.isPrimary && (
                    <button
                      type="button"
                      onClick={() => onSetPrimaryDomain(dom.id)}
                      className="px-3.5 py-2 text-xs font-medium border border-[#D8D2C9] dark:border-[#323238] rounded-lg text-[#181615] dark:text-[#F4F1EA] hover:bg-[#F3EFEA] dark:hover:bg-[#222228] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Set as Primary
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleVerify(dom.id)}
                    disabled={isChecking}
                    className="px-4 py-2 text-xs font-medium bg-[#181615] dark:bg-[#F4F1EA] text-[#FAF8F5] dark:text-[#0C0C0E] rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                    <span>{isChecking ? 'Running DNS & TLS Probe...' : 'Verify DNS & SSL'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteDomain(dom.id)}
                    aria-label="Remove domain"
                    className="p-2 text-[#B91C1C] hover:bg-[#B91C1C]/10 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 2-Column Split: Left Required Registrar Records + Right Live DNS & SSL Telemetry */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Required DNS Configuration */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-[#181615] dark:text-[#F4F1EA] flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5" />
                    <span>Required Registrar DNS Records</span>
                  </div>

                  <div className="overflow-x-auto border border-[#E6E1DA] dark:border-[#26262B] rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#E6E1DA] dark:border-[#26262B] bg-[#FAF8F5] dark:bg-[#121215] text-[#6E6A63]">
                          <th className="py-2 px-3 font-medium">Type</th>
                          <th className="py-2 px-3 font-medium">Host / Name</th>
                          <th className="py-2 px-3 font-medium">Value / Target</th>
                          <th className="py-2 px-3 font-medium text-right">Copy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFECE6] dark:divide-[#222228] font-mono">
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-[#181615] dark:text-[#F4F1EA]">
                            {dom.expectedRecordType}
                          </td>
                          <td className="py-2.5 px-3 text-[#6E6A63]">
                            {dom.expectedRecordType === 'A' ? '@' : dom.domain.split('.')[0]}
                          </td>
                          <td className="py-2.5 px-3 text-[#181615] dark:text-[#F4F1EA] truncate max-w-[180px]">
                            {dom.expectedTarget}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => copyValue(`target-${dom.id}`, dom.expectedTarget)}
                              className="p-1 text-[#6E6A63] hover:text-[#181615] dark:hover:text-white cursor-pointer"
                            >
                              {copiedKey === `target-${dom.id}` ? (
                                <Check className="w-3.5 h-3.5 text-[#15803D]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-[#181615] dark:text-[#F4F1EA]">
                            TXT
                          </td>
                          <td className="py-2.5 px-3 text-[#6E6A63] truncate max-w-[120px]">
                            _atelier-verify
                          </td>
                          <td className="py-2.5 px-3 text-[#181615] dark:text-[#F4F1EA] truncate max-w-[180px]">
                            {dom.txtVerificationValue}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => copyValue(`txt-${dom.id}`, dom.txtVerificationValue)}
                              className="p-1 text-[#6E6A63] hover:text-[#181615] dark:hover:text-white cursor-pointer"
                            >
                              {copiedKey === `txt-${dom.id}` ? (
                                <Check className="w-3.5 h-3.5 text-[#15803D]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Live Server-Side DNS & TLS Handshake Output */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-[#181615] dark:text-[#F4F1EA] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Live DNS Resolution & X.509 SSL Telemetry</span>
                  </div>

                  <div className="border border-[#E6E1DA] dark:border-[#26262B] rounded-lg p-4 bg-[#FAF8F5] dark:bg-[#121215] space-y-2.5 text-xs">
                    <div className="text-[#4A4640] dark:text-[#B8B3A8]">
                      {dom.diagnosticMessage}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#E6E1DA] dark:border-[#222228] font-mono text-[11px]">
                      <div>
                        <span className="text-[#6E6A63]">Resolved IPv4 (A): </span>
                        <span className="text-[#181615] dark:text-[#F4F1EA]">
                          {dom.resolvedA.length > 0 ? dom.resolvedA.join(', ') : 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6E6A63]">Resolved CNAME: </span>
                        <span className="text-[#181615] dark:text-[#F4F1EA]">
                          {dom.resolvedCname.length > 0 ? dom.resolvedCname.join(', ') : 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6E6A63]">Nameservers (NS): </span>
                        <span className="text-[#181615] dark:text-[#F4F1EA]">
                          {dom.resolvedNs.length > 0 ? dom.resolvedNs.slice(0, 2).join(', ') : 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6E6A63]">SSL Certificate Issuer: </span>
                        <span className="text-[#181615] dark:text-[#F4F1EA]">
                          {dom.sslIssuer || 'N/A'}
                        </span>
                      </div>
                      {dom.sslValidTo && (
                        <div className="sm:col-span-2">
                          <span className="text-[#6E6A63]">SSL Validity Window: </span>
                          <span className="text-[#181615] dark:text-[#F4F1EA] tabular-nums">
                            {dom.sslValidFrom} → {dom.sslValidTo}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Redirect Rules Engine Section */}
      <div className="pt-6 border-t border-[#E6E1DA] dark:border-[#26262B] space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#181615] dark:text-[#F4F1EA]">
              02. HTTP Redirect & Path Forwarding Rules
            </h2>
            <p className="text-xs text-[#6E6A63] dark:text-[#9E988E] mt-1">
              Configure clean 301 Permanent or 302 Temporary vanity path redirects across your connected domains.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleAddRedirect}
          className="border border-[#E6E1DA] dark:border-[#26262B] bg-white dark:bg-[#16161A] rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
        >
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
              Source Path
            </label>
            <input
              type="text"
              required
              value={sourcePath}
              onChange={(e) => setSourcePath(e.target.value)}
              placeholder="/monograph"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
            />
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
              Destination URL
            </label>
            <input
              type="text"
              required
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
              HTTP Status
            </label>
            <select
              value={statusCode}
              onChange={(e) => setStatusCode(Number(e.target.value) as 301 | 302)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
            >
              <option value={301}>301 Permanent</option>
              <option value={302}>302 Temporary</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2 px-4 text-xs font-medium bg-[#181615] dark:bg-[#F4F1EA] text-[#FAF8F5] dark:text-[#0C0C0E] rounded-lg hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          </div>
        </form>

        <div className="border border-[#E6E1DA] dark:border-[#26262B] bg-white dark:bg-[#16161A] rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E6E1DA] dark:border-[#26262B] bg-[#FAF8F5] dark:bg-[#121215] text-[#6E6A63]">
                <th className="py-3 px-4 font-medium">Source Path</th>
                <th className="py-3 px-4 font-medium">Destination Target</th>
                <th className="py-3 px-4 font-medium">Status Type</th>
                <th className="py-3 px-4 font-medium text-right">Forwarded Hits</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6] dark:divide-[#222228]">
              {redirects.map((rule) => (
                <tr key={rule.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#1C1C22]">
                  <td className="py-3 px-4 font-mono font-medium text-[#181615] dark:text-[#F4F1EA]">
                    {rule.sourcePath}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#6E6A63] dark:text-[#9E988E]">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[320px]">{rule.destinationUrl}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-[#181615] dark:text-[#F4F1EA]">
                    HTTP {rule.statusCode}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-[#6E6A63]">
                    {rule.hits}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateRedirects(
                            redirects.map((r) =>
                              r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                            )
                          )
                        }
                        className="px-2.5 py-1 rounded border border-[#E6E1DA] dark:border-[#26262B] text-xs cursor-pointer"
                      >
                        {rule.enabled ? 'Enabled' : 'Paused'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateRedirects(redirects.filter((r) => r.id !== rule.id))
                        }
                        aria-label="Delete redirect rule"
                        className="p-1 text-[#B91C1C] hover:bg-[#B91C1C]/10 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
