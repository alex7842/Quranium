import React, { useState } from 'react';
import { Card, Form, Button, Toast, ToastContainer } from 'react-bootstrap';
import { Power, Copy, Check, Loader2 } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ResponseData } from './types';

const App = () => {
  const [serverStatus, setServerStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [account, setAccount] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [transactionId, setTransactionId] = useState<string>('');
  const [isTransactionId,setisTransactionId]=useState<boolean>(false);
  const [selectedType,setSelectedType]=useState<string>('1');
  const showToast = (message: string, type: 'success' | 'danger') => {
    setToast({ show: true, message, type });
  };

  const startServer = async () => {
    try {
      setServerStatus('connecting');
      setIsServerLoading(true);
      console.log("type frontend",selectedType);
      const res = await fetch('http://localhost:3001/server/start-server', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: selectedType }),
      });
      console.log(res);
      const data: ResponseData = await res.json();
      
      if (data.success) {
      
        setServerStatus('connected');
        showToast('Server connected successfully', 'success');
      } else {
        setServerStatus('disconnected');
        showToast(`Connection failed: ${data.message}`, 'danger');
      }
    } catch (error: any) {
      setServerStatus('disconnected');
      showToast(`Connection error: ${error.message}`, 'danger');
    } finally {
      setIsServerLoading(false);
    }
  };

  const sendFunds = async () => {
    if (!account || !amount) {
      showToast('Please fill in all fields', 'danger');
      return;
    }

    try {
      setIsTransactionLoading(true);
      setisTransactionId(false);
      const res = await fetch('http://localhost:3001/wallet/send-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account, amount }),
      });
      const data: ResponseData = await res.json();
      
      if (data.success) {
        const txnId = `TXN${Math.random().toString(36).substr(2, 9)}`;
        setTransactionId(txnId);
        showToast('Transaction successful!', 'success');
        setisTransactionId(true);
        setAccount('');
        setAmount('');
      
        setTimeout(() => {
          setTransactionId('');
        }, 3000);
      } else {
        showToast(`Transaction failed: ${data.message}`, 'danger');
      }
    } catch (error: any) {
      showToast(`Error: ${error.message}`, 'danger');
    } finally {
      setIsTransactionLoading(false);
    }
  };

  const copyTransactionId = () => {
    navigator.clipboard.writeText(transactionId);
    showToast('Transaction ID copied!', 'success');
  };
  const stopserver= async ()=>{
    setServerStatus('disconnected');
    setIsServerLoading(false);
    showToast('Server disconnected successfully', 'success');
    const res = await fetch('http://localhost:3001/server/stop-server', {
     
    });
    const data = await res.json();
    console.log(data);
    
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
      <Card style={{ width: '100%', maxWidth: '400px', backgroundColor: '#f8f9fa', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <Card.Header className="text-center border-0 bg-transparent pt-4">
          <h4 className="mb-4">Quranium Client</h4>
          <div className="d-flex  gap-3 mb-4">
            <div className='flex-1 me-3 w-25'>
            <Form.Select
         onChange={(e) => setSelectedType(e.target.value)}

             aria-label="Default select example">
     
      <option value="1">Main</option>
      <option value="2">TestNet</option>
 
    </Form.Select>
            </div>
            <button
              onClick={startServer}
              disabled={isServerLoading || serverStatus === 'connecting'}
              className="btn flex-2  rounded-circle border border-1  border-black p-0 d-flex align-items-center justify-content-center"
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: serverStatus === 'connected' ? '#4ADE80' : '#e9ecef',
                border: 'none',
                transition: 'all 0.3s ease',
                boxShadow: serverStatus === 'connected' 
                  ? '0 0 20px rgba(74, 222, 128, 0.4)' 
                  : '0 4px 6px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isServerLoading ? (
                <div 
                  className="position-relative"
                  style={{
                    width: '40px',
                    height: '40px'
                  }}
                >
                  <Loader2 
                    size={40}
                    className="animate-spin"
                    style={{
                      color: '#4ADE80',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                </div>
              ) : (
                <Power 
                  size={40} 
                  style={{ 
                    color: serverStatus === 'connected' ? '#000' : '#666',
                    opacity: serverStatus === 'connected' ? 1 : 0.7,
                    strokeWidth: 2.5
                  }} 
                //  fill={serverStatus === 'connected' ? '#000' : 'transparent'}
                />
              )}
            </button>
          </div>
          
          <div 
            className="text-center mb-3" 
            style={{ 
              color: serverStatus === 'connected' ? '#15803d' : '#666',
              fontSize: '1.1rem',
              fontWeight: 500
            }}
          >
            {serverStatus === 'connected' ? 'Server is Connected' : 'Server not Connected'}
          </div>
          <div className='d-flex  justify-content-end mb-4'>
            <button 
              disabled={serverStatus !== 'connected'}
              style={{ 
               // cursor: serverStatus !== 'connected' ? 'not-allowed' : 'cursor-pointer',
                backgroundColor: serverStatus === 'connected' ? '#E43637' : '#ccc',
              }}
              onClick={stopserver}

              
            className='border border-1  border-black  p-1 text-white rounded-3'>Stop Server</button>

          </div>
        </Card.Header>
        <Card.Body>
          <Form className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Enter Account Number"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                disabled={serverStatus !== 'connected'}
                style={{ 
                  cursor: serverStatus !== 'connected' ? 'not-allowed' : 'text',
                  backgroundColor: serverStatus === 'connected' ? '#fff' : '#f5f5f5',
                  border: '1px solid rgb(0, 0, 0)',
                  padding: '0.75rem',
                  borderRadius: '8px'
                }}
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={serverStatus !== 'connected'}
                min="0"
                style={{ 
                  cursor: serverStatus !== 'connected' ? 'not-allowed' : 'text',
                  backgroundColor: serverStatus === 'connected' ? '#fff' : '#f5f5f5',
                  border: '1px solid rgb(0, 0, 0)',
                  padding: '0.75rem',
                  borderRadius: '8px'
                }}
              />
            </Form.Group>
            <Button
              variant={serverStatus === 'connected' ? "success" : "secondary"}
              onClick={sendFunds}
              disabled={isTransactionLoading || serverStatus !== 'connected'}
              style={{ 
                backgroundColor: serverStatus === 'connected' ? '#4ADE80' : '#6c757d',
                border: 'none',
                color: '#000',
                padding: '0.75rem',
                borderRadius: '8px',
                position: 'relative'
              }}
            >
              {isTransactionLoading ? (
                <div className="d-flex align-items-center justify-content-center">
                  <Loader2 
                    size={18} 
                    className="me-2"
                    style={{
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                  Processing...
                </div>
              ) : (
                'Proceed'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={toast.show} 
          onClose={()=>{
             setToast({ ...toast, show: false })
            setisTransactionId(false)
          }}
          bg={toast.type}
          style={{
            backgroundColor: toast.type === 'success' ? '#4ADE80' : '#ef4444',
            color: '#fff'
          }}
        >
          <Toast.Header 
            style={{
              backgroundColor: toast.type === 'success' ? '#22c55e' : '#dc2626',
              color: '#fff',
              border: 'none'
            }}
            closeButton={true}
          >
            <strong className="me-auto">
              {toast.type === 'success' ? (
                <Check size={16} className="me-1" />
              ) : null}
              {toast.type === 'success' ? 'Success' : 'Error'}
            </strong>
          </Toast.Header>
          <Toast.Body>
            {toast.message}
            {isTransactionId && toast.type === 'success' && (
              <div className="mt-2">
                <code className="bg-white text-dark px-2 py-1 rounded">{transactionId}</code>
                <Button
                  variant="light"
                  size="sm"
                  className="ms-2"
                  onClick={copyTransactionId}
                >
                  <Copy size={14} />
                </Button>
              </div>
            )}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default App;