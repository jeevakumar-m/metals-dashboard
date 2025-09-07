let chartInstance;

async function fetchJSON(path) {
  try {
    const res = await fetch(path + '?_cachebust=' + Date.now());
    if (!res.ok) throw new Error('Fetch failed: ' + res.status);
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch', path, e);
    return null;
  }
}

function formatNumber(v, currency) {
  if (currency === 'INR') return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v);
  if (currency === 'EUR') return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(v);
  if (currency === 'GBP') return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(v);
  if (currency === 'JPY') return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(v);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}

async function loadData(selectedCurrency = 'USD') {
  const metals = await fetchJSON('data/metals.json');
  const news = await fetchJSON('data/news.json');
  const sentiment = await fetchJSON('data/sentiment.json');

  if (!metals) {
    alert('No metals data found. Please ensure GitHub Actions has run and data/metals.json exists.');
    return;
  }

  const goldUSD = metals.rates && metals.rates.XAU ? metals.rates.XAU : null;
  const silverUSD = metals.rates && metals.rates.XAG ? metals.rates.XAG : null;

  // Conversion factor: metals-api returns rates relative to base=USD.
  let conversionRate = 1;
  if (selectedCurrency !== 'USD') {
    conversionRate = metals.rates && metals.rates[selectedCurrency] ? metals.rates[selectedCurrency] : 1;
  }

  const gold = goldUSD * conversionRate;
  const silver = silverUSD * conversionRate;

  document.getElementById('gold-price').innerText = gold ? formatNumber(gold, selectedCurrency) : '—';
  document.getElementById('silver-price').innerText = silver ? formatNumber(silver, selectedCurrency) : '—';

  // Rule-based Gold/Silver ratio signal
  const ratio = goldUSD && silverUSD ? (goldUSD / silverUSD) : null;
  const aiSignal = document.getElementById('ai-signal');
  if (ratio) {
    let signal = 'Balanced market ⚖️';
    if (ratio > 80) signal = 'Silver undervalued 📉 (Gold relatively high)';
    else if (ratio < 50) signal = 'Gold undervalued 📉 (Silver relatively high)';
    aiSignal.innerText = `${signal} — Gold/Silver ratio: ${ratio.toFixed(2)}`;
  } else {
    aiSignal.innerText = 'No ratio data';
  }

  // News + sentiment (pairing by index)
  const list = document.getElementById('news-list');
  list.innerHTML = '';
  if (news && Array.isArray(news)) {
    for (let i = 0; i < news.length; i++) {
      const headline = news[i];
      const s = sentiment && sentiment[i] && sentiment[i][0] ? sentiment[i][0] : null;
      const li = document.createElement('li');
      li.innerHTML = `<strong>${headline}</strong><br/>` + (s ? `<em>Sentiment:</em> ${s.label} (${(s.score*100).toFixed(1)}%)` : '<em>Sentiment:</em> n/a');
      list.appendChild(li);
    }
  } else {
    list.innerHTML = '<li>No news data</li>';
  }

  // Chart of current prices
  const ctx = document.getElementById('priceChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Gold (XAU)', 'Silver (XAG)'],
      datasets: [{
        label: `Price in ${selectedCurrency}`,
        data: [gold || 0, silver || 0],
        backgroundColor: ['rgba(212,175,55,0.9)', 'rgba(192,192,192,0.9)']
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: false } }
    }
  });
}

document.getElementById('currency').addEventListener('change', (e) => {
  loadData(e.target.value);
});
document.getElementById('refresh').addEventListener('click', () => loadData(document.getElementById('currency').value));

// initial load
loadData();
