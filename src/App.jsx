import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Download, Eye, FileText, Plus, Printer, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

const defaultBusiness = {
  name: 'SVEMS PHOTOGRAPHY',
  owner: 'PULINDU D PEIRIS PHOTOGRAPHY',
  address: '58/31, Dibbadda Road, Nalluruwa, Panadura',
  email: 'pulindudpeiris93@gmail.com',
  phone: '',
  bankAccountName: 'H.P.S Peiris',
  bankName: 'HNB',
  accountNumber: '069020545692',
  logo: ''
}

const blankInvoice = {
  customerName: 'Moratuwa-Piliyandala District Scout Branch District Camp',
  date: new Date().toISOString().slice(0, 10),
  invoiceNo: '2709',
  advance: 0,
  items: [{ description: 'Group Photo Charges', qty: 1, rate: 3000 }]
}

function money(n) {
  return Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function App() {
  const [business, setBusiness] = useState(() => {
    try { return JSON.parse(localStorage.getItem('invoice-business')) || defaultBusiness } catch { return defaultBusiness }
  })
  const [invoice, setInvoice] = useState(blankInvoice)
  const [showPreview, setShowPreview] = useState(true)
  const [logoPreview, setLogoPreview] = useState(business.logo || '')
  const invoiceRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('invoice-business', JSON.stringify({ ...business, logo: logoPreview }))
  }, [business, logoPreview])

  const subtotal = useMemo(
    () => invoice.items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.rate || 0), 0),
    [invoice.items]
  )
  const total = Math.max(0, subtotal - Number(invoice.advance || 0))

  const updateBusiness = (key, value) => setBusiness(prev => ({ ...prev, [key]: value }))
  const updateInvoice = (key, value) => setInvoice(prev => ({ ...prev, [key]: value }))

  const updateItem = (index, key, value) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [key]: value } : item)
    }))
  }

  const addItem = () => setInvoice(prev => ({
    ...prev,
    items: [...prev.items, { description: '', qty: 1, rate: 0 }]
  }))

  const removeItem = (index) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.length === 1 ? prev.items : prev.items.filter((_, i) => i !== index)
    }))
  }

  const resetInvoice = () => setInvoice({
    ...blankInvoice,
    date: new Date().toISOString().slice(0, 10),
    invoiceNo: String(Math.floor(1000 + Math.random() * 9000))
  })

  const handleLogo = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const generatePDF = async () => {
    if (!invoiceRef.current) return
    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const ratio = Math.min(pageWidth / (canvas.width / 2), pageHeight / (canvas.height / 2))
    const width = canvas.width * ratio / 2
    const height = canvas.height * ratio / 2
    pdf.addImage(imgData, 'PNG', (pageWidth - width) / 2, (pageHeight - height) / 2, width, height)
    pdf.save(`Invoice-${invoice.invoiceNo || 'invoice'}.pdf`)
  }

  const printInvoice = () => window.print()

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon"><FileText size={21}/></div>
          <div><strong>Invoice Generator</strong><span>Professional PDF invoices</span></div>
        </div>
        <div className="top-actions">
          <button className="ghost" onClick={() => setShowPreview(v => !v)}><Eye size={17}/> {showPreview ? 'Hide Preview' : 'Show Preview'}</button>
          <button className="primary" onClick={generatePDF}><Download size={17}/> Download PDF</button>
        </div>
      </header>

      <main className="workspace">
        <section className="panel form-panel">
          <div className="section-head"><div><h2>Invoice Details</h2><p>Enter the information for your bill.</p></div></div>

          <div className="form-section">
            <h3>Business Information</h3>
            <div className="grid two">
              <Field label="Business Name" value={business.name} onChange={v => updateBusiness('name', v)} />
              <Field label="Owner / Subtitle" value={business.owner} onChange={v => updateBusiness('owner', v)} />
              <Field label="Address" value={business.address} onChange={v => updateBusiness('address', v)} />
              <Field label="Email" value={business.email} onChange={v => updateBusiness('email', v)} />
              <Field label="Phone" value={business.phone} onChange={v => updateBusiness('phone', v)} />
            </div>
            <label className="upload-box">
              <Upload size={18}/>
              <span>{logoPreview ? 'Change logo' : 'Upload logo (optional)'}</span>
              <input type="file" accept="image/*" onChange={handleLogo}/>
            </label>
          </div>

          <div className="form-section">
            <h3>Customer & Invoice</h3>
            <div className="grid two">
              <Field label="Customer Name" value={invoice.customerName} onChange={v => updateInvoice('customerName', v)} />
              <Field label="Invoice Number" value={invoice.invoiceNo} onChange={v => updateInvoice('invoiceNo', v)} />
              <Field label="Date" type="date" value={invoice.date} onChange={v => updateInvoice('date', v)} />
            </div>
          </div>

          <div className="form-section">
            <div className="items-head"><h3>Items / Services</h3><button className="small-primary" onClick={addItem}><Plus size={16}/> Add Item</button></div>
            <div className="items-editor">
              {invoice.items.map((item, index) => (
                <div className="item-row" key={index}>
                  <div className="item-desc"><label>Description</label><input value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} placeholder="Service or item"/></div>
                  <div><label>Qty</label><input type="number" min="0" value={item.qty} onChange={e => updateItem(index, 'qty', e.target.value)}/></div>
                  <div><label>Rate (LKR)</label><input type="number" min="0" value={item.rate} onChange={e => updateItem(index, 'rate', e.target.value)}/></div>
                  <div className="line-total"><label>Amount</label><strong>LKR {money(Number(item.qty || 0) * Number(item.rate || 0))}</strong></div>
                  <button className="icon-btn danger" title="Remove" onClick={() => removeItem(index)}><Trash2 size={17}/></button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Payment</h3>
            <div className="grid two">
              <Field label="Advance / Less (LKR)" type="number" value={invoice.advance} onChange={v => updateInvoice('advance', v)} />
              <div className="summary-mini"><span>Balance</span><strong>LKR {money(total)}</strong></div>
            </div>
          </div>

          <div className="form-section">
            <h3>Bank Details</h3>
            <div className="grid three">
              <Field label="Account Name" value={business.bankAccountName} onChange={v => updateBusiness('bankAccountName', v)} />
              <Field label="Bank" value={business.bankName} onChange={v => updateBusiness('bankName', v)} />
              <Field label="Account Number" value={business.accountNumber} onChange={v => updateBusiness('accountNumber', v)} />
            </div>
          </div>

          <div className="bottom-actions">
            <button className="ghost" onClick={resetInvoice}><RotateCcw size={17}/> New Invoice</button>
            <button className="ghost" onClick={() => localStorage.setItem('invoice-business', JSON.stringify({...business, logo: logoPreview}))}><Save size={17}/> Save Business Details</button>
            <button className="primary" onClick={generatePDF}><Download size={17}/> Generate PDF</button>
          </div>
        </section>

        {showPreview && (
          <section className="preview-area">
            <div className="preview-toolbar"><span><Eye size={16}/> Live Preview</span><button className="ghost small" onClick={printInvoice}><Printer size={15}/> Print</button></div>
            <div className="paper-wrap">
              <InvoicePreview ref={invoiceRef} business={{...business, logo: logoPreview}} invoice={invoice} subtotal={subtotal} total={total}/>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

const Field = ({ label, value, onChange, type = 'text' }) => (
  <div className="field">
    <label>{label}</label>
    <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} />
  </div>
)

const InvoicePreview = React.forwardRef(({ business, invoice, subtotal, total }, ref) => (
  <div className="invoice-paper" ref={ref}>
    <div className="invoice-title">INVOICE</div>

    <div className="invoice-company">
      {business.logo && <img className="invoice-logo" src={business.logo} alt="Logo"/>}
      <h1>{business.name || 'BUSINESS NAME'}</h1>
      <h2>{business.owner || ''}</h2>
      <p>{business.address}</p>
      <p>{business.email}{business.phone ? `  |  ${business.phone}` : ''}</p>
    </div>

    <div className="meta">
      <div><strong>Customer Name :</strong> {invoice.customerName}</div>
      <div><strong>Date :</strong> {invoice.date}</div>
      <div></div>
      <div><strong>Invoice No :</strong> {invoice.invoiceNo}</div>
    </div>

    <table className="invoice-table">
      <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
      <tbody>
        {invoice.items.map((item, i) => (
          <tr key={i}>
            <td>{item.description}</td>
            <td>{item.qty}</td>
            <td>{money(item.rate)}</td>
            <td>{money(Number(item.qty || 0) * Number(item.rate || 0))}</td>
          </tr>
        ))}
        <tr className="advance-row"><td>Less : Advance</td><td></td><td></td><td>{Number(invoice.advance || 0) ? `-${money(invoice.advance)}` : ''}</td></tr>
      </tbody>
    </table>

    <div className="total-row"><span>TOTAL</span><strong>{money(total)}</strong></div>

    <div className="bank">
      <h3>Bank Details</h3>
      <div>A/c Name: {business.bankAccountName}</div>
      <div>Bank : {business.bankName}</div>
      <div>A/C Number : {business.accountNumber}</div>
    </div>
  </div>
))

export default App
