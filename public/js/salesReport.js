document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.report-controls');
  
    
    form.addEventListener('submit', async function(event) {
      event.preventDefault();
  

      const formData = new FormData(form);
    
      
      const params = new URLSearchParams();

      for (const [key, value] of formData.entries()) {
        params.append(key, value);
      }
 
        console.log(params.toString());
        
      if (formData.get('download')) {
        window.location.href = `/admin/sales-report?${params.toString()}`;
        return;
      }
  
      try {
  
        const response = await fetch(`/admin/sales-report?${params.toString()}`, {
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
  
        updateSummary(data);
        updateTable(data.salesReport);
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    });
  
  
    function updateSummary(data) {
      const summaryContainer = document.getElementById('reportSummary');
      summaryContainer.innerHTML = `
        <h3>Report from ${data.startDate} to ${data.endDate}</h3>
        <div class="summary-cards">
          <div class="card">
            <h4>Total Orders</h4>
            <p>${data.report.totalSales}</p>
          </div>
          <div class="card">
            <h4>Total Sales</h4>
            <p>₹${data.report.totalAmount.toFixed(2)}</p>
          </div>
          <div class="card">
            <h4>Total Discounts</h4>
            <p>₹${data.report.totalDiscount.toFixed(2)}</p>
          </div>
          <div class="card">
            <h4>Coupons Used</h4>
            <p>${data.report.couponsUsed}</p>
          </div>
        </div>
      `;
    }
  
    // Update the table with the sales report data
    function updateTable(salesReport) {
      const tableBody = document.querySelector('table tbody');
      tableBody.innerHTML = ''; // Clear existing rows
  
      if (salesReport.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center">No report</td></tr>`;
      } else if (salesReport.length > 10) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center">No preview available please download</td></tr>`;
      } else {
        salesReport.forEach(order => {
          order.products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${order._id}</td>
              <td>${order.userName}</td>
              <td>${order.paymentMethod}</td>
              <td>${order.couponUsed ? 'Yes' : 'No'}</td>
              <td>${order.discount}</td>
              <td>${product.product}</td>
              <td>${product.price}</td>
              <td>${order.totalAmount}</td>
            `;
            tableBody.appendChild(row);
          });
        });
      }
    }
  

    const periodSelect = document.getElementById('periodSelect');
    periodSelect.addEventListener('change', function() {
      const customDateRange = document.getElementById('customDateRange');
      customDateRange.style.display = (this.value === 'custom') ? 'block' : 'none';
    });
  });
  