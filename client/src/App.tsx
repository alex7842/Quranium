import React, { useState } from 'react';
import { Card, Form, Button, Toast, ToastContainer } from 'react-bootstrap';
import { Power, Copy, Check, Loader2 } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ResponseData } from './types';

const App = () => {
  const [serverStatus, setServerStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [account, setAccount] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [isTransactionToast, setIsTransactionToast] = useState(false);

  const [localBlocks, setLocalBlocks] = useState<number>(0);
  const [totalBlocks, setTotalBlocks] = useState<number>(0);
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [transactionId, setTransactionId] = useState<string>('');
  const [isTransactionId,setisTransactionId]=useState<boolean>(false);
  const [selectedType,setSelectedType]=useState<string>('2');

// Modify the showToast function
const showToast = (message: string, type: 'success' | 'danger') => {
  setToast({ show: true, message, type });
};

const copyTransactionId = () => {
  navigator.clipboard.writeText(transactionId);
  setToast({ show: false, message: '', type: 'success' });
  setisTransactionId(false);
  
  // Show copy confirmation toast
  showToast('Transaction ID copied!', 'success');
};

  const startServer = async () => {
    try {
        setServerStatus('connecting');
        setIsServerLoading(true);
        
        const response = await fetch('http://localhost:3001/server/start-server', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: selectedType }),
        });

        const reader = response.body?.getReader();
        if (!reader) return;

        // Read the streaming response
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Convert the chunk to text and parse JSON
            const chunk = new TextDecoder().decode(value);
            const updates = chunk.split('\n').filter(Boolean);

            updates.forEach(update => {
                const data = JSON.parse(update);
                
                if (data.syncing) {
                    // Update progress in UI
                    setProgress(data.progress);
                    setLocalBlocks(data.localBlocks);
                    setTotalBlocks(data.totalBlocks);
                } else {
                    // Final sync complete
                    setServerStatus('connected');
                    setLocalBlocks(data.localBlocks);
                    setTotalBlocks(data.totalBlocks);
                    showToast('Blocks fully synced!', 'success');
                }
            });
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
      setTransactionId("");
      const res = await fetch('http://localhost:3001/wallet/send-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account:account, amount:amount,type:selectedType }),
      });

      const data: ResponseData = await res.json();
     // console.log(data);
      
      if (data.success) {
        const txnId = `${data.data}`;
        setTransactionId(txnId);
        showToast('Transaction successful!', 'success');
        setisTransactionId(true);
        setAccount('');
        setAmount('');
      
        // setTimeout(() => {
        //   setTransactionId('');
        // }, 3000);
      } else {
        showToast(`Transaction failed: ${data.message}`, 'danger');
      }
    } catch (error: any) {
      showToast(`Error: ${error.message}`, 'danger');
    } finally {
      setIsTransactionLoading(false);
    }
  };
  

  const stopserver= async ()=>{
    setServerStatus('disconnected');
    setisTransactionId(false);
    setIsServerLoading(false);
    showToast('Server disconnected successfully', 'success');
    const res = await fetch('http://localhost:3001/server/stop-server', {
     
    });
    const data = await res.json();
   // console.log(data);
    
  }

  return (
    <div className="min-vh-100 bg d-flex align-items-center justify-content-center p-3"
    style={{ 
      // backgroundColor: '#f0f0f0',
      backgroundImage: 'url(./bitcoin.jpg)',
      position: 'relative',
      overflow: 'hidden' // Light red background
    }}
    >
      {/* <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'red', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}> */}
      <div 
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 100%)',
      pointerEvents: 'none'
    }}
  />
      <Card
       style={{ 
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(251, 248, 248, 0.71)',
        backdropFilter: 'blur(21px) saturate(173%)',
        WebkitBackdropFilter: 'blur(21px) saturate(173%)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        zIndex: 1
      }}
       >
        <Card.Header className="text-center border-0  pt-4">
        <div className='d-flex justify-content-center align-items-center gap-2 mb-4'>
  <img 
    src="./logobg.png" 
    alt="Logo" 
    style={{ width: '25px', height: '25px' }} 
  />
  <h4 className="m-0">Quranium Client</h4>
</div>
          <div className="d-flex  gap-3 mb-4">
            <div className='flex-1 me-3 '
            style={{width:"28%"}}>
            <Form.Select
            style={{width:"100%",border:"1px solid black"}}
         onChange={(e) => setSelectedType(e.target.value)}

             aria-label="Default select example">
     
      <option value="2">Testnet</option>
      <option value="1">Main</option>
 
    </Form.Select>
            </div>
            <button
  onClick={startServer}
  disabled={isServerLoading || serverStatus === 'connecting'}
  className="btn flex-2 rounded-circle p-0 d-flex align-items-center justify-content-center position-relative"
  style={{
    width: '120px',
    height: '120px',
    backgroundColor: serverStatus === 'connected' ? '#4ADE80' : '#ccc',
    border: '2px solid #000',
    borderBottom: '4px solid #000',
    transition: 'all 0.3s ease',
    boxShadow: serverStatus === 'connected' 
      ? '0 0 20px rgba(103, 232, 22, 0.4)' 
      : '0 6px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
    overflow: 'visible',
    position: 'relative',
  }}
>
  {serverStatus === 'disconnected' && (
    <span className=" fs-3">Start</span>
  )}

  {serverStatus === 'connecting' && (
    <>
      <div
        className="position-absolute rotating-loader"
        style={{
          width: '140px',
          height: '140px',
          border: '4px solid transparent',
          borderTop: '4px solid #4ADE80',
          borderRadius: '50%',
          animation: 'rotate 1.5s linear infinite',
          top: '-10px',
          left: '-10px',
        }}
      />
      <div className="text-center">
        {localBlocks && totalBlocks ? (
          <div className="d-flex flex-column align-items-center">
            <small className="fw-bold text-black">{localBlocks}/{totalBlocks}</small>
            <small className="fw-bold text-black">Syncing...</small>
          </div>
        ) : (
          <div className="pulse-effect">
            Syncing
          </div>
        )}
      </div>
    </>
  )}

  {serverStatus === 'connected' && (
    <Power
      size={40}
      style={{
        color: '#000',
        opacity: 1,
        strokeWidth: 2.5,
        animation: 'fadeIn 0.5s ease',
      }}
    />
  )}
</button>

          </div>
          
          <div 
            className="text-center mb-2" 
            style={{ 
              color: serverStatus === 'connected' ? '#15803d' : '#666',
              fontSize: '1.1rem',
              fontWeight: 500
            }}
          >
               {localBlocks>0 && totalBlocks>0 && (
    
          <div className='d-flex justify-content-end'>{ `${localBlocks} / ${totalBlocks} blocks`} </div>
         
       
    )}
     </div>
     <div

      className="text-center mb-2" 
      style={{ 
        color: serverStatus === 'connected' ? '#15803d' : '#666',
        fontSize: '1.1rem',
        fontWeight: 500
      }}
    >
            {serverStatus === 'connected' ? `Server is Connected ${selectedType==='1'?"to Main":"to Testnet"}` : 'Server not Connected'}</div>
         
          <div className='d-flex  justify-content-end mb-4'>
            <button 
              disabled={serverStatus !== 'connected'}
              style={{ 
               // cursor: serverStatus !== 'connected' ? 'not-allowed' : 'cursor-pointer',
                backgroundColor: serverStatus === 'connected' ? '#E43637' : '#ccc',
                color:serverStatus === 'connected' ? '#fff' : '#000'
              }}
              onClick={stopserver}

              
            className='border border-1  border-black  p-1  rounded-3'
         
            >Stop Server</button>

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
    onClose={() => {
      setToast({ ...toast, show: false });
      if (isTransactionId) {
        setisTransactionId(false);
      }
    }}
    autohide={!isTransactionId}
    delay={3000}
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
                <code className="bg-white text-dark px-2 py-1 rounded w-25 ">{transactionId}</code>
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