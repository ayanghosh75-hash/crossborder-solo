// CrossBorder Solo — Reactive Invoicing Engine
// Author: Ayan Kumar Ghosh (https://www.buymeacoffee.com/AyanKumarGhosh)

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  AED: 'AED ',
  SGD: 'S$',
  INR: '₹'
};

const APPROX_INR_RATES = {
  USD: 86.80,
  EUR: 91.50,
  GBP: 109.80,
  AUD: 56.40,
  CAD: 61.20,
  AED: 23.60,
  SGD: 64.50,
  INR: 1.00
};

// Initial State
let invoiceState = {
  invoiceNumber: 'INV-2026-0042',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  currency: 'USD',
  lutEnabled: true,
  lutArn: 'AD190426009841K',
  
  // Sender (Freelancer / Consultant)
  senderName: 'Ayan Kumar Ghosh',
  senderTitle: 'Senior Full-Stack AI Engineer & Consultant',
  senderAddress: 'Kolkata, West Bengal, India\nPIN: 700014',
  senderEmail: 'ayanghosh75@gmail.com',
  senderGstin: '19ABCDE1234F1Z5',
  senderPan: 'ABCDE1234F',
  
  // Client (Overseas)
  clientCompany: 'Apex Digital Solutions Inc.',
  clientContact: 'Sarah Jenkins, VP of Engineering',
  clientAddress: '548 Market St, Suite 39201\nSan Francisco, CA 94104, USA',
  clientEmail: 'billing@apexdigital.io',
  
  // Items
  items: [
    { description: 'Full-Stack Web Application Architecture & AI Integration (Sprint 1)', qty: 40, rate: 35 },
    { description: 'Production Deployment & Cloud Security Hardening', qty: 1, rate: 450 }
  ],
  
  // Payment Details
  bankName: 'State Bank of India (SBI)',
  accountNumber: '38910482019',
  ifscCode: 'SBIN0000123',
  swiftBic: 'SBININBB123',
  wiseTag: 'ayan-ghosh-75',
  stripeLink: 'https://buy.stripe.com/demo-invoice',
  
  notes: 'Payment is due within 14 days of invoice date. Thank you for your partnership!'
};

// Render & Sync
function renderAll() {
  const sym = CURRENCY_SYMBOLS[invoiceState.currency] || '$';
  
  // 1. Update Preview Meta
  document.getElementById('prevInvNumber').innerText = invoiceState.invoiceNumber;
  document.getElementById('prevInvDate').innerText = invoiceState.invoiceDate;
  document.getElementById('prevDueDate').innerText = invoiceState.dueDate;
  
  // 2. Sender
  document.getElementById('prevSenderName').innerText = invoiceState.senderName;
  document.getElementById('prevSenderTitle').innerText = invoiceState.senderTitle;
  document.getElementById('prevSenderAddress').innerText = invoiceState.senderAddress;
  document.getElementById('prevSenderEmail').innerText = invoiceState.senderEmail;
  document.getElementById('prevSenderTaxId').innerText = `GSTIN: ${invoiceState.senderGstin} | PAN: ${invoiceState.senderPan}`;
  
  // 3. Client
  document.getElementById('prevClientCompany').innerText = invoiceState.clientCompany;
  document.getElementById('prevClientContact').innerText = invoiceState.clientContact;
  document.getElementById('prevClientAddress').innerText = invoiceState.clientAddress;
  document.getElementById('prevClientEmail').innerText = invoiceState.clientEmail;
  
  // 4. Line Items Table in Preview
  const tbody = document.getElementById('prevItemsBody');
  tbody.innerHTML = '';
  
  let subtotal = 0;
  invoiceState.items.forEach((item, idx) => {
    const itemTotal = (item.qty || 0) * (item.rate || 0);
    subtotal += itemTotal;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong>${item.description || 'Service description'}</strong>
      </td>
      <td class="text-right">${item.qty}</td>
      <td class="text-right">${sym}${Number(item.rate).toFixed(2)}</td>
      <td class="text-right"><strong>${sym}${itemTotal.toFixed(2)}</strong></td>
    `;
    tbody.appendChild(tr);
  });
  
  // 5. Totals
  document.getElementById('prevSubtotal').innerText = `${sym}${subtotal.toFixed(2)}`;
  document.getElementById('prevGrandTotal').innerText = `${sym}${subtotal.toFixed(2)} ${invoiceState.currency}`;
  
  // Dual-Currency Calculation for Indian Freelancers
  const inrRate = APPROX_INR_RATES[invoiceState.currency] || 1;
  const inrTotal = subtotal * inrRate;
  const dualNote = document.getElementById('prevDualCurrencyNote');
  if (invoiceState.currency !== 'INR') {
    dualNote.style.display = 'block';
    dualNote.innerText = `* Approx. INR Equivalent: ₹${inrTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })} (Ref rate: 1 ${invoiceState.currency} ≈ ₹${inrRate.toFixed(2)})`;
  } else {
    dualNote.style.display = 'none';
  }
  
  // 6. GST LUT Statutory Notice
  const lutNotice = document.getElementById('prevLutNotice');
  if (invoiceState.lutEnabled) {
    lutNotice.style.display = 'block';
    lutNotice.innerText = `SUPPLY MEANT FOR EXPORT OF SERVICES UNDER LETTER OF UNDERTAKING (LUT) WITHOUT PAYMENT OF INTEGRATED TAX (IGST). ARN: ${invoiceState.lutArn} / FY 2026-27.`;
  } else {
    lutNotice.style.display = 'none';
  }
  
  // 7. Payment Info
  document.getElementById('prevBankName').innerText = invoiceState.bankName;
  document.getElementById('prevAccountNum').innerText = invoiceState.accountNumber;
  document.getElementById('prevIfsc').innerText = invoiceState.ifscCode;
  document.getElementById('prevSwift').innerText = invoiceState.swiftBic;
  
  const wiseWrap = document.getElementById('prevWiseWrap');
  if (invoiceState.wiseTag) {
    wiseWrap.style.display = 'block';
    document.getElementById('prevWiseTag').innerText = invoiceState.wiseTag;
  } else {
    wiseWrap.style.display = 'none';
  }
  
  document.getElementById('prevNotes').innerText = invoiceState.notes;
}

// Render Editor Line Items Form
function renderEditorItems() {
  const container = document.getElementById('editorItemsContainer');
  container.innerHTML = '';
  
  invoiceState.items.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'line-item-row';
    row.innerHTML = `
      <input type="text" placeholder="Description" value="${item.description}" data-idx="${idx}" data-field="description">
      <input type="number" placeholder="Qty/Hrs" value="${item.qty}" data-idx="${idx}" data-field="qty" step="any">
      <input type="number" placeholder="Rate" value="${item.rate}" data-idx="${idx}" data-field="rate" step="any">
      <button class="btn-remove-item" data-idx="${idx}" title="Remove Item">&times;</button>
    `;
    container.appendChild(row);
  });
  
  // Attach listeners to items
  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = e.target.getAttribute('data-idx');
      const field = e.target.getAttribute('data-field');
      const val = e.target.value;
      invoiceState.items[idx][field] = field === 'qty' || field === 'rate' ? parseFloat(val) || 0 : val;
      renderAll();
    });
  });
  
  container.querySelectorAll('.btn-remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.getAttribute('data-idx');
      if (invoiceState.items.length > 1) {
        invoiceState.items.splice(idx, 1);
        renderEditorItems();
        renderAll();
      } else {
        alert('Invoice must have at least one line item.');
      }
    });
  });
}

// Setup Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Populate form fields from state
  document.getElementById('inpInvNumber').value = invoiceState.invoiceNumber;
  document.getElementById('inpInvDate').value = invoiceState.invoiceDate;
  document.getElementById('inpDueDate').value = invoiceState.dueDate;
  document.getElementById('inpCurrency').value = invoiceState.currency;
  
  document.getElementById('inpSenderName').value = invoiceState.senderName;
  document.getElementById('inpSenderTitle').value = invoiceState.senderTitle;
  document.getElementById('inpSenderAddress').value = invoiceState.senderAddress;
  document.getElementById('inpSenderEmail').value = invoiceState.senderEmail;
  document.getElementById('inpSenderGstin').value = invoiceState.senderGstin;
  document.getElementById('inpSenderPan').value = invoiceState.senderPan;
  
  document.getElementById('inpClientCompany').value = invoiceState.clientCompany;
  document.getElementById('inpClientContact').value = invoiceState.clientContact;
  document.getElementById('inpClientAddress').value = invoiceState.clientAddress;
  document.getElementById('inpClientEmail').value = invoiceState.clientEmail;
  
  document.getElementById('inpLutToggle').checked = invoiceState.lutEnabled;
  document.getElementById('inpLutArn').value = invoiceState.lutArn;
  
  document.getElementById('inpBankName').value = invoiceState.bankName;
  document.getElementById('inpAccountNum').value = invoiceState.accountNumber;
  document.getElementById('inpIfsc').value = invoiceState.ifscCode;
  document.getElementById('inpSwift').value = invoiceState.swiftBic;
  document.getElementById('inpWiseTag').value = invoiceState.wiseTag;
  document.getElementById('inpNotes').value = invoiceState.notes;
  
  // Generic Field Bindings
  const bindInput = (id, prop) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', (e) => {
        invoiceState[prop] = e.target.value;
        renderAll();
      });
    }
  };
  
  bindInput('inpInvNumber', 'invoiceNumber');
  bindInput('inpInvDate', 'invoiceDate');
  bindInput('inpDueDate', 'dueDate');
  bindInput('inpSenderName', 'senderName');
  bindInput('inpSenderTitle', 'senderTitle');
  bindInput('inpSenderAddress', 'senderAddress');
  bindInput('inpSenderEmail', 'senderEmail');
  bindInput('inpSenderGstin', 'senderGstin');
  bindInput('inpSenderPan', 'senderPan');
  bindInput('inpClientCompany', 'clientCompany');
  bindInput('inpClientContact', 'clientContact');
  bindInput('inpClientAddress', 'clientAddress');
  bindInput('inpClientEmail', 'clientEmail');
  bindInput('inpBankName', 'bankName');
  bindInput('inpAccountNum', 'accountNumber');
  bindInput('inpIfsc', 'ifscCode');
  bindInput('inpSwift', 'swiftBic');
  bindInput('inpWiseTag', 'wiseTag');
  bindInput('inpNotes', 'notes');
  
  // Currency Select
  document.getElementById('inpCurrency').addEventListener('change', (e) => {
    invoiceState.currency = e.target.value;
    renderAll();
  });
  
  // LUT Toggle
  document.getElementById('inpLutToggle').addEventListener('change', (e) => {
    invoiceState.lutEnabled = e.target.checked;
    renderAll();
  });
  document.getElementById('inpLutArn').addEventListener('input', (e) => {
    invoiceState.lutArn = e.target.value;
    renderAll();
  });
  
  // Add Line Item Button
  document.getElementById('btnAddLineItem').addEventListener('click', () => {
    invoiceState.items.push({ description: 'New Consulting Milestone / Deliverable', qty: 1, rate: 100 });
    renderEditorItems();
    renderAll();
  });
  
  // 1-Click Print / Download PDF
  document.getElementById('btnPrintPdf').addEventListener('click', () => {
    window.print();
  });
  
  // Load Sample Button
  document.getElementById('btnLoadSample').addEventListener('click', () => {
    invoiceState.items = [
      { description: 'Cloud Infrastructure Architecture & Microservices Engineering', qty: 50, rate: 45 },
      { description: 'Security Audit & OWASP Vulnerability Remediations', qty: 1, rate: 850 },
      { description: 'Technical Documentation & Team Knowledge Transfer', qty: 10, rate: 40 }
    ];
    invoiceState.currency = 'USD';
    document.getElementById('inpCurrency').value = 'USD';
    renderEditorItems();
    renderAll();
  });
  
  // Nudge Modal (WhatsApp & Email Reminder Generator)
  const nudgeModal = document.getElementById('nudgeModal');
  const btnNudge = document.getElementById('btnNudge');
  const btnCloseNudge = document.getElementById('btnCloseNudge');
  const nudgeText = document.getElementById('nudgeText');
  const btnCopyNudge = document.getElementById('btnCopyNudge');
  
  btnNudge.addEventListener('click', () => {
    const sym = CURRENCY_SYMBOLS[invoiceState.currency] || '$';
    let total = 0;
    invoiceState.items.forEach(i => total += (i.qty * i.rate));
    
    const message = `Hi ${invoiceState.clientContact},\n\nI hope you're having a productive week! Just a friendly note regarding Invoice ${invoiceState.invoiceNumber} for ${sym}${total.toFixed(2)} (${invoiceState.currency}), which is scheduled for payment by ${invoiceState.dueDate}.\n\nYou can easily wire the funds to the account details on the invoice or via Wise (${invoiceState.wiseTag}).\n\nPlease let me know if you need any additional tax documentation from my end. Thank you again for our partnership!\n\nBest regards,\n${invoiceState.senderName}`;
    
    nudgeText.value = message;
    nudgeModal.style.display = 'flex';
  });
  
  btnCloseNudge.addEventListener('click', () => { nudgeModal.style.display = 'none'; });
  
  btnCopyNudge.addEventListener('click', () => {
    navigator.clipboard.writeText(nudgeText.value).then(() => {
      btnCopyNudge.innerText = 'Copied to Clipboard! ✓';
      btnCopyNudge.style.background = '#10b981';
      setTimeout(() => {
        btnCopyNudge.innerText = '📋 Copy Reminder Text';
        btnCopyNudge.style.background = '';
      }, 2500);
    });
  });
  
  // VIP Modal
  const vipModal = document.getElementById('vipModal');
  const btnVip = document.getElementById('btnVip');
  const btnCloseVip = document.getElementById('btnCloseVip');
  
  btnVip.addEventListener('click', () => { vipModal.style.display = 'flex'; });
  btnCloseVip.addEventListener('click', () => { vipModal.style.display = 'none'; });
  
  window.addEventListener('click', (e) => {
    if (e.target === nudgeModal) nudgeModal.style.display = 'none';
    if (e.target === vipModal) vipModal.style.display = 'none';
  });
  
  // Copy UPI ID
  const btnCopyUpiSolo = document.getElementById('btnCopyUpiSolo');
  if (btnCopyUpiSolo) {
    btnCopyUpiSolo.addEventListener('click', () => {
      navigator.clipboard.writeText('ayanghosh75@oksbi').then(() => {
        const orig = btnCopyUpiSolo.innerText;
        btnCopyUpiSolo.innerText = '✅ Copied!';
        btnCopyUpiSolo.style.background = '#10b981';
        setTimeout(() => {
          btnCopyUpiSolo.innerText = orig;
          btnCopyUpiSolo.style.background = '#f59e0b';
        }, 2000);
      });
    });
  }

  // Passcode Activation
  const btnActivatePasscode = document.getElementById('btnActivatePasscode');
  const inpPasscode = document.getElementById('inpPasscode');
  if (btnActivatePasscode && inpPasscode) {
    btnActivatePasscode.addEventListener('click', () => {
      const code = inpPasscode.value.trim().toUpperCase();
      if (code === 'SOLOFREE52' || code === 'VIPAYAN' || code === 'CROSSBORDER2026') {
        alert('🎉 Congratulations! Your Lifetime VIP License is now permanently activated.');
        btnVip.innerText = '🌟 Lifetime VIP Active';
        btnVip.style.background = '#10b981';
        vipModal.style.display = 'none';
      } else {
        alert('Invalid activation passcode. Please verify or purchase a license.');
      }
    });
  }

  // Initial Render
  renderEditorItems();
  renderAll();
});
