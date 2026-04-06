import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);

  // Fetch data from Node.js every 2 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/logs');
        setLogs(response.data.reverse()); // Reverse so newest is on the right of the graph
      } catch (error) {
        console.error("Error fetching logs", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Calculate some quick stats
  const totalRequests = logs.length;
  const blockedRequests = logs.filter(log => log.actionTaken === 'BLOCKED').length;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#1e1e1e', color: 'white', minHeight: '100vh' }}>
      <h1>🛡️ Smart API Security Dashboard</h1>
      
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ background: '#333', padding: '1.5rem', borderRadius: '8px', flex: 1 }}>
          <h3>Total Traffic Monitored</h3>
          <p style={{ fontSize: '2rem', margin: 0, color: '#4caf50' }}>{totalRequests}</p>
        </div>
        <div style={{ background: '#333', padding: '1.5rem', borderRadius: '8px', flex: 1 }}>
          <h3>Threats Blocked</h3>
          <p style={{ fontSize: '2rem', margin: 0, color: '#f44336' }}>{blockedRequests}</p>
        </div>
      </div>

      <div style={{ background: '#333', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', height: '300px' }}>
        <h3>Risk Score Over Time</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={logs}>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="timestamp" tick={false} stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none' }} />
            <Line type="monotone" dataKey="riskScore" stroke="#ff9800" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: '#333', padding: '1.5rem', borderRadius: '8px' }}>
        <h3>Live Activity Log</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #555' }}>
              <th>IP Address</th>
              <th>Endpoint</th>
              <th>Risk Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[...logs].reverse().slice(0, 10).map((log, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #444', height: '40px' }}>
                <td>{log.ipAddress}</td>
                <td>{log.endpoint}</td>
                <td>{log.riskScore?.toFixed(2) || '0.00'}</td>
                <td style={{ color: log.actionTaken === 'BLOCKED' ? '#f44336' : '#4caf50', fontWeight: 'bold' }}>
                  {log.actionTaken}
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