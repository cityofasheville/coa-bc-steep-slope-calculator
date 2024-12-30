const spinnerMarkup = `
  <div class='spinner-border' role='status'>
    <span class='sr-only'>Loading...</span>
  </div>
`;

function outputResultTable(data) {
  return `
    <table class="table table-bordered">
      <tbody>
        <tr>
          <th width="200px">Jurisdiction</th>
          <td>${data.jurisdiction}</td>
        </tr>
        <tr>
          <th>Acres</th>
          <td>${data.acres}</td>
        </tr>
        <tr>
          <th>Max Elevation</th>
          <td>${data.maxElevation}</td>
        </tr>
        <tr>
          <th>Percent Slope</th>
          <td>${data.percentSlope}</td>
        </tr>
      </tbody>
    </table>
  `;
}

document.addEventListener('DOMContentLoaded', function () {
  let showDisclaimer = true;
  let disclaimerAcknowledgement = localStorage.getItem('disclaimerAcknowledgement');
  if (disclaimerAcknowledgement) {
    showDisclaimer = false;
  }
  const disclaimerButton = document.getElementById('acceptDisclaimer');
  disclaimerButton.addEventListener('click', function () {
    localStorage.setItem('disclaimerAcknowledgement', 'true');
  });

  if (showDisclaimer) {
    $('#gisDisclaimer').modal({
      show: true,
      backdrop: 'static',
      keyboard: false,
      focus: true,
    });
  }

  const form = document.getElementById('slopeForm');
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const pinInput = event.target.pinInput.value;
    try {
      if (!document.getElementById('resultsDiv')) {
        const newResultsDiv = document.createElement('div');
        newResultsDiv.classList.add('p-3', 'bg-light', 'border', 'rounded');
        newResultsDiv.id = 'resultsDiv';
        const parentElement = document.getElementById('resultsParent');
        parentElement.appendChild(newResultsDiv);
      }

      let resultsDiv = document.getElementById('resultsDiv');

      if (pinInput.length !== 10 && pinInput.length !== 15) {
        resultsDiv.innerHTML = 'PIN must be 10 or 15 digits.';
        return;
      } else if (pinInput.length === 10) {
        if (pinInput.match(/[^0-9]/)) {
          resultsDiv.innerHTML = 'PIN must be all numbers.';
          return;
        }
      } else if (pinInput.length === 15) {
        if (pinInput.match(/[^0-9-]/)) {
          resultsDiv.innerHTML = 'PIN must be all numbers or numbers and dashes.';
          return;
        }
      }
      resultsDiv.innerHTML = spinnerMarkup;

      let response = await fetch(`/api/slopebypin/${pinInput}`);
      if (!response.ok) {
        throw new Error(`HTTP error, status: ${response.status}`);
      }
      let data = await response.json();
      let resultContent = '';

      if (data.id == 0) {
        resultContent = `PIN not found. Verify that it is a valid 10 or 15 digit PIN number in Buncombe County.`;
      } else {
        if (window.location.pathname === '/api/slopebypin') {
          resultContent = JSON.stringify(data, null, 2);
        } else {
          resultContent = outputResultTable(data);
        }
      }

      document.getElementById('resultsDiv').innerHTML = resultContent;
    } catch (error) {
      console.error('error', error);
      document.getElementById(
        'resultsDiv'
      ).innerHTML = `There was an error processing your request: ${error.message}`;
    }
  });
});
