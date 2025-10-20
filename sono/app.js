// Procedure definitions
const procedures = [
    { id: 1, name: 'Sonohyst for tubes + uterus', code: 'J476', price: 31.50 },
    { id: 2, name: 'Sonohyst for cavity only', code: 'J165', price: 34.10 },
    { id: 3, name: 'AFC GYN scan', code: 'J162+J138', price: 54.55 },
    { id: 4, name: 'OB US low risk', code: 'J157+J138', price: 45.30 },
    { id: 5, name: 'OB US high risk', code: 'J160+J138', price: 60.40 },
    { id: 6, name: 'IC monitoring', code: 'J164+J138', price: 39.90 },
    { id: 7, name: 'MVA Ultrasound guidance', code: 'J149', price: 37.90 }
];

// Data storage
let entries = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    document.getElementById('entryDate').valueAsDate = new Date();
    
    // Set current month as default for report
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    document.getElementById('reportMonth').value = currentMonth;
    
    updateDisplay();
});

// Add new entry
function addEntry() {
    const date = document.getElementById('entryDate').value;
    const procedureId = parseInt(document.getElementById('procedureType').value);
    const patientName = document.getElementById('patientName').value.trim();
    const patientId = document.getElementById('patientId').value.trim();

    if (!date || !patientName || !patientId) {
        alert('Please fill in all fields');
        return;
    }

    entries.push({
        id: Date.now(),
        date,
        procedureId,
        patientName,
        patientId
    });

    // Clear patient fields but keep date and procedure
    document.getElementById('patientName').value = '';
    document.getElementById('patientId').value = '';
    document.getElementById('patientName').focus();

    updateDisplay();
}

// Remove entry
function removeEntry(id) {
    entries = entries.filter(e => e.id !== id);
    updateDisplay();
}

// Update display
function updateDisplay() {
    const container = document.getElementById('entriesContainer');
    const countSpan = document.getElementById('entryCount');
    const emailHomeBtn = document.getElementById('emailHomeBtn');
    const emailOfficeBtn = document.getElementById('emailOfficeBtn');
    const reportBtn = document.getElementById('reportBtn');

    countSpan.textContent = entries.length;
    emailHomeBtn.disabled = entries.length === 0;
    emailOfficeBtn.disabled = entries.length === 0;
    reportBtn.disabled = entries.length === 0;

    if (entries.length === 0) {
        container.innerHTML = '<div class="empty-state">No entries yet. Add your first procedure above.</div>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Procedure</th>
                    <th>Patient Name</th>
                    <th>Patient ID</th>
                    <th>Code</th>
                    <th>Price</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
    `;

    entries.forEach(entry => {
        const proc = procedures.find(p => p.id === entry.procedureId);
        html += `
            <tr>
                <td>${entry.date}</td>
                <td>${proc.name}</td>
                <td>${entry.patientName}</td>
                <td>${entry.patientId}</td>
                <td>${proc.code}</td>
                <td>$${proc.price.toFixed(2)}</td>
                <td>
                    <button class="btn-danger" onclick="removeEntry(${entry.id})" title="Delete">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Generate email summary for home (content only with signature)
function generateEmailHome() {
    const groupedByDate = {};

    entries.forEach(entry => {
        if (!groupedByDate[entry.date]) {
            groupedByDate[entry.date] = {};
        }
        if (!groupedByDate[entry.date][entry.procedureId]) {
            groupedByDate[entry.date][entry.procedureId] = [];
        }
        groupedByDate[entry.date][entry.procedureId].push(entry);
    });

    let emailBody = '';
    
    const dates = Object.keys(groupedByDate).sort();
    
    dates.forEach(date => {
        const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        emailBody += `Hello Steph, I performed and reported the following ultrasounds on ${formattedDate}:\n\n`;
        
        Object.entries(groupedByDate[date]).forEach(([procId, procEntries]) => {
            const proc = procedures.find(p => p.id === parseInt(procId));
            emailBody += `${proc.name}:\n`;
            procEntries.forEach(entry => {
                emailBody += `${entry.patientName} PID: ${entry.patientId}\n`;
            });
            emailBody += '\n';
        });
    });

    emailBody += '\n';
    emailBody += 'Best regards,\n\n';
    emailBody += 'Jennia Michaeli,\n';
    emailBody += 'MD, ObGyn, REI\n';

    navigator.clipboard.writeText(emailBody).then(() => {
        alert('Email content copied to clipboard! Paste it into your email client.');
    }).catch(() => {
        prompt('Copy this email content:', emailBody);
    });
}

// Generate email for office (VBS script download)
function generateEmailOffice() {
    const groupedByDate = {};

    entries.forEach(entry => {
        if (!groupedByDate[entry.date]) {
            groupedByDate[entry.date] = {};
        }
        if (!groupedByDate[entry.date][entry.procedureId]) {
            groupedByDate[entry.date][entry.procedureId] = [];
        }
        groupedByDate[entry.date][entry.procedureId].push(entry);
    });

    let emailContent = '';
    
    const dates = Object.keys(groupedByDate).sort();
    const dateStr = dates.length === 1 
        ? new Date(dates[0] + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Multiple Dates';
    
    dates.forEach(date => {
        const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        emailContent += `<p>Hello Steph, I performed and reported the following ultrasounds on ${formattedDate}:</p>`;
        
        Object.entries(groupedByDate[date]).forEach(([procId, procEntries]) => {
            const proc = procedures.find(p => p.id === parseInt(procId));
            emailContent += `<p><strong>${proc.name}:</strong><br>`;
            procEntries.forEach(entry => {
                emailContent += `${entry.patientName} PID: ${entry.patientId}<br>`;
            });
            emailContent += '</p>';
        });
    });

    const escapedContent = emailContent.replace(/"/g, '""');

    const vbsScript = `Set objOutlook = CreateObject("Outlook.Application")
Set objMail = objOutlook.CreateItem(0)
objMail.Subject = "Sono reports - Jennia Michaeli ${dateStr}"
objMail.BodyFormat = 2
objMail.TO = "Jessop, Stephanie; Dr.Michaelis office; Padar, Michelle"
objMail.CC = "Michaeli, Jennia <Jennia.Michaeli@sinaihealth.ca>"
objMail.GetInspector
Dim existingHTML
existingHTML = objMail.HTMLBody
objMail.HTMLBody = "${escapedContent}" & existingHTML
objMail.Display`;

    const blob = new Blob([vbsScript], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `sono_report_${new Date().toISOString().split('T')[0]}.vbs`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Clear all data
function clearAllData() {
    if (entries.length === 0) {
        alert('No data to clear.');
        return;
    }
    
    if (confirm('Are you sure you want to clear all entries? This action cannot be undone.')) {
        entries = [];
        updateDisplay();
    }
}

// Show month picker modal
function showMonthPicker() {
    document.getElementById('monthPickerModal').classList.add('show');
}

// Close month picker modal
function closeMonthPicker() {
    document.getElementById('monthPickerModal').classList.remove('show');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('monthPickerModal');
    if (event.target === modal) {
        closeMonthPicker();
    }
}

// Generate monthly report CSV
function generateMonthlyReport() {
    const monthInput = document.getElementById('reportMonth').value;
    
    if (!monthInput) {
        alert('Please select a month and year');
        return;
    }
    
    const [year, month] = monthInput.split('-');
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    const filtered = entries.filter(e => {
        const entryDate = new Date(e.date + 'T12:00:00');
        return entryDate.getMonth() + 1 === monthNum && entryDate.getFullYear() === yearNum;
    });

    if (filtered.length === 0) {
        alert(`No entries found for ${monthNum}/${yearNum}`);
        return;
    }

    const groupedByDateAndProc = {};
    
    filtered.forEach(entry => {
        const key = `${entry.date}_${entry.procedureId}`;
        if (!groupedByDateAndProc[key]) {
            groupedByDateAndProc[key] = {
                date: entry.date,
                procedureId: entry.procedureId,
                count: 0,
                total: 0
            };
        }
        groupedByDateAndProc[key].count++;
        const proc = procedures.find(p => p.id === entry.procedureId);
        groupedByDateAndProc[key].total += proc.price;
    });

    let csv = 'Date,Procedure,Code,Count,Unit Price,Total\n';
    let grandTotal = 0;

    Object.values(groupedByDateAndProc).forEach(item => {
        const proc = procedures.find(p => p.id === item.procedureId);
        csv += `${item.date},"${proc.name}",${proc.code},${item.count},$${proc.price.toFixed(2)},$${item.total.toFixed(2)}\n`;
        grandTotal += item.total;
    });

    csv += `\n,,,,,TOTAL: $${grandTotal.toFixed(2)}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${yearNum}_${month.padStart(2, '0')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    closeMonthPicker();
}