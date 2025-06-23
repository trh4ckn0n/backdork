// src/app.js

import React, { useState } from 'react';

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
    setVulnerabilities(prev =>
      prev.includes(vuln)
        ? prev.filter(v => v !== vuln)
        : [...prev, vuln]
    );
  };

  const runDorking = async () => {
    setLoading(true);
    const dorkList = dorks.split("\n").map(d => d.trim()).filter(Boolean);

    try {
      const res = await fetch("http://backdork-b.onrender.com:5000/api/scrape", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dorks: dorkList,
          country,
          gpt: gptEnabled,
          vulnerabilities,
          results_per_dork: Number(resultsPerDork)
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
    const data = exportFormat === "json"
      ? JSON.stringify(results, null, 2)
      : results.map(r => `${r.dork},${r.url},${r.risk},${r.country}`).join("\n");

    const blob = new Blob([data], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dorkhunter_results.${exportFormat}`;
    a.click();
  };

  const vulnOptions = ["SQL Injection", "XSS", "LFI", "RCE", "Directory Traversal"];

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", color: "#6610f2" }}>DorkHunter - Offensive Dorking Suite</h1>

      <div style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem", borderRadius: "10px" }}>
        <label>Dork Patterns</label>
        <br />
        <textarea
          rows={6}
          style={{ width: "100%" }}
          value={dorks}
          onChange={(e) => setDorks(e.target.value)}
        />

        <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
          <div>
            <label>Country TLD</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder=".fr, .ca, etc."
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>GPT Analysis</label>
            <button onClick={() => setGptEnabled(!gptEnabled)}>
              {gptEnabled ? "Enabled ✅" : "Disabled ❌"}
            </button>
          </div>
          <div>
            <label>Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <div>
            <label>Results per Dork</label>
            <input
              type="number"
              value={resultsPerDork}
              min="1"
              max="50"
              onChange={(e) => setResultsPerDork(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label>Vulnerability Filters</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {vulnOptions.map(v => (
              <button
                key={v}
                onClick={() => toggleVulnerability(v)}
                style={{
                  padding: "0.5rem 1rem",
                  border: vulnerabilities.includes(v) ? "2px solid #6610f2" : "1px solid gray",
                  backgroundColor: vulnerabilities.includes(v) ? "#f0f0ff" : "#fff"
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <button onClick={runDorking} disabled={loading} style={{ marginTop: "1rem", width: "100%", padding: "1rem" }}>
          {loading ? "Scanning..." : "Run Dorking"}
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Results</h2>
          <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "1rem" }}>
            <thead>
              <tr>
                <th>Dork</th>
                <th>URL</th>
                <th>Risk</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res, i) => (
                <tr key={i}>
                  <td>{res.dork}</td>
                  <td><a href={res.url} target="_blank" rel="noreferrer">{res.url}</a></td>
                  <td>{res.risk}</td>
                  <td>{res.country}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={exportResults} style={{ marginTop: "1rem" }}>
            Export {exportFormat.toUpperCase()}
          </button>
        </div>
      )}
    </div>
  );
}
