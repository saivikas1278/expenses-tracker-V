import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const PRESET_CATEGORY_COLORS = {
  salary: '#10B981',
  income: '#10B981',
  food: '#F97316',
  'ball money': '#DC2626',
  sports: '#DC2626',
  cloths: '#2563EB',
  clothes: '#2563EB',
};

function normalizeCategory(rawCategory) {
  const cleanedCategory = String(rawCategory || '').trim();
  return cleanedCategory || 'Uncategorized';
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hslToHex(hue, saturation, lightness) {
  const normalizedSaturation = saturation / 100;
  const normalizedLightness = lightness / 100;
  const chroma = (1 - Math.abs(2 * normalizedLightness - 1)) * normalizedSaturation;
  const intermediate = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = normalizedLightness - chroma / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) {
    red = chroma;
    green = intermediate;
  } else if (hue < 120) {
    red = intermediate;
    green = chroma;
  } else if (hue < 180) {
    green = chroma;
    blue = intermediate;
  } else if (hue < 240) {
    green = intermediate;
    blue = chroma;
  } else if (hue < 300) {
    red = intermediate;
    blue = chroma;
  } else {
    red = chroma;
    blue = intermediate;
  }

  const toHex = (channel) => Math.round((channel + match) * 255).toString(16).padStart(2, '0');

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
}

function getCategoryColor(categoryName, usedColors) {
  const normalized = categoryName.toLowerCase();

  if (PRESET_CATEGORY_COLORS[normalized]) {
    return PRESET_CATEGORY_COLORS[normalized];
  }

  const baseHue = hashString(normalized) % 360;
  let hue = baseHue;
  let color = hslToHex(hue, 78, 56);

  while (usedColors.has(color)) {
    hue = (hue + 37) % 360;
    color = hslToHex(hue, 78, 56);
  }

  return color;
}

export default function ExpenseChart({ transactions }) {
  const expenseTotals = transactions.reduce((accumulator, transaction) => {
    const amount = Math.abs(Number(transaction.amount) || 0);
    const category = normalizeCategory(transaction.category || transaction.text);

    if (amount > 0) {
      accumulator[category] = (accumulator[category] || 0) + Math.abs(amount);
    }

    return accumulator;
  }, {});

  const labels = Object.keys(expenseTotals);
  const values = Object.values(expenseTotals);
  const usedColors = new Set();
  const backgroundColors = labels.map((categoryName) => {
    const color = getCategoryColor(categoryName, usedColors);
    usedColors.add(color);
    return color;
  });

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors,
        borderColor: '#0f172a',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e2e8f0',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          boxWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label(context) {
            const value = Number(context.raw) || 0;
            return ` ${context.label}: $${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/20">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Expense Chart
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Spending by category
          </h2>
        </div>
      </div>

      <div className="h-72 sm:h-80 lg:h-[26rem]">
        {labels.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/60 text-center text-slate-400">
            Add an expense to see the category breakdown.
          </div>
        ) : (
          <Pie data={data} options={options} />
        )}
      </div>
    </section>
  );
}
