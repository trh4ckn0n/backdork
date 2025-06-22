// DorkHunter Web App – Advanced Offensive Dorking Suite

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Sparkles, Globe, Search, ShieldCheck, Settings2 } from "lucide-react";

export default function DorkHunter() {
  const [dorks, setDorks] = useState("inurl:php?id=\ninurl:view.php?page=");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState(".fr");
  const [gptEnabled, setGptEnabled] = useState(true);
  const [exportFormat, setExportFormat] = useState("json");
  const [vulnerabilities, setVulnerabilities] = useState(["SQL Injection", "XSS"]);
  const [resultsPerDork, setResultsPerDork] = useState(10);

  const toggleVulnerability = (vuln) => {
    setVulnerabilities(prev => prev.includes(vuln)
      ? prev.filter(v => v !== vuln)
      : [...prev, vuln]);
  };

  const runDorking = async () => {
    setLoading(true);
    const dorkList = dorks.split("\n").map(d => d.trim()).filter(Boolean);

    try {
      const res = await fetch("https://backdork-b.onrender.com:5000/api/scrape", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dorks: dorkList,
          country,
          gpt: gptEnabled,
          vulnerabilities,
          results_per_dork: resultsPerDork
        })
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Scraping failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    const data = exportFormat === "json" ? JSON.stringify(results, null, 2) : results.map(r => `${r.dork},${r.url},${r.risk},${r.country}`).join("\n");
    const blob = new Blob([data], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dorkhunter_results.${exportFormat === "json" ? "json" : "csv"}`;
    a.click();
  };

  const vulnOptions = ["SQL Injection", "XSS", "LFI", "RCE", "Directory Traversal"];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 text-indigo-600"><Globe /> DorkHunter – Offensive Dorking Suite</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <label className="font-semibold">Dork Patterns</label>
          <Textarea rows={6} value={dorks} onChange={(e) => setDorks(e.target.value)} />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="font-semibold">Country TLD</label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g., .fr, .ca, .sn" />
            </div>
            <div>
              <label className="font-semibold">GPT Analysis</label>
              <Button onClick={() => setGptEnabled(!gptEnabled)} variant={gptEnabled ? "default" : "outline"}>
                {gptEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <div>
              <label className="font-semibold">Export Format</label>
              <select className="w-full p-2 rounded-md border" value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            <div>
              <label className="font-semibold">Results per Dork</label>
              <Input type="number" min="1" max="50" value={resultsPerDork} onChange={(e) => setResultsPerDork(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="font-semibold">Vulnerabilities Filter (GPT)</label>
            <div className="flex flex-wrap gap-2">
              {vulnOptions.map(v => (
                <Button
                  key={v}
                  variant={vulnerabilities.includes(v) ? "default" : "outline"}
                  onClick={() => toggleVulnerability(v)}
                >
                  {v}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={runDorking} disabled={loading} className="w-full mt-4">
            <Search className="mr-2" /> {loading ? "Scanning..." : "Run Dorking"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><ShieldCheck /> Results</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Dork</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Risk</TableCell>
                <TableCell>Country</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((res, idx) => (
                <TableRow key={idx}>
                  <TableCell>{res.dork}</TableCell>
                  <TableCell><a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{res.url}</a></TableCell>
                  <TableCell>{res.risk}</TableCell>
                  <TableCell>{res.country}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {results.length > 0 && (
            <div className="mt-4 text-right">
              <Button onClick={exportResults} variant="outline" className="gap-2">
                <Settings2 size={18} /> Export ({exportFormat.toUpperCase()})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
