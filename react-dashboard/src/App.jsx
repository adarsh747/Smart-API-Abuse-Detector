import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/logs');
        setLogs(response.data.reverse());
      } catch (error) {
        console.error("Error fetching logs", error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- NEW: BUSINESS LOGIC ---
  const totalRequests = logs.length;
  const blockedRequests = logs.filter(log => log.actionTaken === 'BLOCKED').length;
  const safeRequests = totalRequests - blockedRequests;

  // Assume every blocked bot saves the company $0.45 in wasted ad-spend and server costs
  const moneySaved = (blockedRequests * 0.45).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div>
            <h1 style={{ margin: 0, color: '#ffffff' }}>🛡️Enterprise Bot Defense</h1>
            <p style={{ margin: '2rem 0 0 0', color: '#888' }}>Real-time threat analytics and cost savings.</p>
          </div>
        </div>
        <div style={{ background: 'linear-gradient(90deg, #1b5e20 0%, #2e7d32 100%)', padding: '1rem 2rem', borderRadius: '8px', border: '1px solid #4caf50', boxShadow: '0 4px 15px rgba(76, 175, 80, 0.2)' }}>
          <h3 style={{ margin: 10, fontSize: '1rem', color: '#a5d6a7', textTransform: 'uppercase' }}>Est. Money Saved</h3>
          <p style={{ fontSize: '2.5rem', margin: 0, color: '#ffffff', fontWeight: 'bold' }}>{moneySaved}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#1e1e1e', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ margin: 0, color: '#888' }}>Total Traffic</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0 0 0', color: '#fff' }}>{totalRequests}</p>
        </div>
        <div style={{ background: '#1e1e1e', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ margin: 0, color: '#888' }}>Verified Humans</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0 0 0', color: '#4caf50' }}>{safeRequests}</p>
        </div>
        <div style={{ background: '#2c1414', border: '1px solid #ff5252', padding: '1.5rem', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ margin: 0, color: '#ff8a80' }}>Malicious Bots Blocked</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0 0 0', color: '#ff5252' }}>{blockedRequests}</p>
        </div>
      </div>

      <div style={{ background: '#1e1e1e', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', height: '300px' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Live Threat Scoring</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={logs}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="timestamp" tick={false} stroke="#888" />
            <YAxis stroke="#888" domain={[0, 1]} />
            <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }} />
            <Line type="monotone" dataKey="riskScore" stroke="#ff9800" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: '#1e1e1e', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Recent Access Logs</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444', color: '#888' }}>
              <th style={{ paddingBottom: '0.5rem' }}>IP Address</th>
              <th style={{ paddingBottom: '0.5rem' }}>Origin</th>
              <th style={{ paddingBottom: '0.5rem' }}>Target Route</th>
              <th style={{ paddingBottom: '0.5rem' }}>Risk Score</th>
              <th style={{ paddingBottom: '0.5rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {[...logs].reverse().slice(0, 10).map((log, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #2a2a2a', height: '45px' }}>
                <td style={{ fontFamily: 'monospace' }}>{log.ipAddress}</td>
                <td>{log.location || 'Local Network'}</td>
                <td style={{ color: '#03a9f4' }}>{log.endpoint}</td>
                <td style={{ fontWeight: 'bold', color: log.riskScore >= 0.7 ? '#ff5252' : '#fff' }}>
                  {log.riskScore?.toFixed(2) || '0.00'}
                </td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    backgroundColor: log.actionTaken === 'BLOCKED' ? '#ffebee' : '#e8f5e9',
                    color: log.actionTaken === 'BLOCKED' ? '#c62828' : '#2e7d32'
                  }}>
                    {log.actionTaken}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;