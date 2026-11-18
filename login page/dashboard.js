console.log(Chart);

// SELECT ELEMENTS
const logout = document.querySelector("#logoutBtn");
const darkMode = document.querySelector("#darkModeToggle");
const addTransactionBtn = document.querySelector("#openAddModalBtn");
const closeBtn = document.querySelector(".close-modal");
const modal = document.querySelector("#transactionModal");
const form = document.querySelector("#transactionForm");

const txType = document.querySelector("#txType");
const txDescription = document.querySelector("#txDescription");
const txAmount = document.querySelector("#txAmount");
const txDate = document.querySelector("#txDate");
const txCategory = document.querySelector("#txCategory");
const txId = document.querySelector("#txId");

const table = document.querySelector("#transactionTableBody");

const displayBalance = document.querySelector("#displayBalance");
const displayIncome = document.querySelector("#displayIncome");
const displayExpense = document.querySelector("#displayExpense");
const displayCount = document.querySelector("#displayCount");

const searchInput = document.querySelector("#searchInput");
const typeFilter = document.querySelector("#typeFilter");
const resetDataBtn = document.querySelector("#resetDataBtn");

const settingsForm = document.querySelector("#settingsForm");
const settingName = document.querySelector("#settingName");
const settingCurrency = document.querySelector("#settingCurrency");
const topbarName = document.querySelector("#topbarName");

const modalTitle = document.querySelector("#modalTitle");
const modalSubmitBtn = form.querySelector('button[type="submit"]');

// LOGOUT
logout.addEventListener("click", () => {
  window.location.href = "login.html";
});

// DARK MODE
darkMode.addEventListener("change", () => {
  if (darkMode.checked) {
    document.body.classList.add("dark-theme");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-theme");
    localStorage.setItem("theme", "light");
  }
});

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark-theme");
  darkMode.checked = true;
} else {
  document.body.classList.remove("dark-theme");
  darkMode.checked = false;
}

// CHART
let myChart = null;

function updateChart(income, expense, currency) {
  const ctx = document.getElementById("cashFlowChart").getContext("2d");

  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: "bar",

    data: {
      labels: ["Income vs Expenses"],

      datasets: [
        {
          label: "Income",
          data: [income],
          backgroundColor: "#166534",
          borderRadius: 4,
        },
        {
          label: "Expenses",
          data: [expense],
          backgroundColor: "#991b1b",
          borderRadius: 4,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: "top",
        },
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            callback: function (value) {
              return currency + value;
            },
          },
        },
      },
    },
  });
}

// ADD TRANSACTION MODAL
addTransactionBtn.addEventListener("click", () => {
  form.reset();
  txId.value = "";

  modalTitle.textContent = "Add Transaction";
  modalSubmitBtn.textContent = "Save Transaction";

  modal.style.display = "flex";
});

// CLOSE MODAL
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  form.reset();
  txId.value = "";
});

// ADD AND EDIT TRANSACTION
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const transaction = {
    id: txId.value ? Number(txId.value) : Date.now(),
    type: txType.value,
    description: txDescription.value,
    amount: Number(txAmount.value),
    date: txDate.value,
    category: txCategory.value,
  };

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  if (txId.value) {
    transactions = transactions.map((elem) => {
      if (elem.id === transaction.id) {
        return transaction;
      }

      return elem;
    });
  } else {
    transactions.push(transaction);
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));

  renderTransactions();

  form.reset();
  txId.value = "";

  modal.style.display = "none";

  modalTitle.textContent = "Add Transaction";
  modalSubmitBtn.textContent = "Save Transaction";
});

// RENDER TRANSACTIONS
function renderTransactions() {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  const currency = localStorage.getItem("currency") || "$";

  let totalIncome = 0;
  let totalExpense = 0;

  // CALCULATE TOTALS
  transactions.forEach((elem) => {
    if (elem.type === "income") {
      totalIncome += elem.amount;
    } else {
      totalExpense += elem.amount;
    }
  });

  // UPDATE DASHBOARD CARDS
  displayIncome.textContent = `${currency}${totalIncome.toFixed(2)}`;

  displayExpense.textContent = `${currency}${totalExpense.toFixed(2)}`;

  displayBalance.textContent = `${currency}${(totalIncome - totalExpense).toFixed(2)}`;

  displayCount.textContent = transactions.length;

  // UPDATE CHART
  updateChart(totalIncome, totalExpense, currency);

  // SEARCH AND FILTER
  const searchTerm = searchInput.value.toLowerCase();
  const selectedType = typeFilter.value;

  const filteredTransactions = transactions.filter((elem) => {
    const matchesSearch =
      elem.description.toLowerCase().includes(searchTerm) ||
      elem.category.toLowerCase().includes(searchTerm);

    const matchesType = selectedType === "all" || elem.type === selectedType;

    return matchesSearch && matchesType;
  });

  // DISPLAY TABLE
  table.innerHTML = "";

  filteredTransactions.forEach((elem) => {
    const row = document.createElement("tr");

    let textClass;

    if (elem.type === "income") {
      textClass = "text-green";
    } else {
      textClass = "text-red";
    }

    row.innerHTML = `
      <td>${elem.date}</td>

      <td class="transaction-description">
        ${elem.description}
      </td>

      <td>${elem.category}</td>

      <td class="${textClass}">
        ${currency}${elem.amount.toFixed(2)}
      </td>

      <td>
        <button class="action-btn btn-edit" data-id="${elem.id}">
          <i class="fa-solid fa-pen"></i>
        </button>

        <button class="action-btn btn-delete" data-id="${elem.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;

    table.appendChild(row);
  });
}

// INITIAL RENDER
renderTransactions();

// RESET ALL DATA
resetDataBtn.addEventListener("click", () => {
  const confirmReset = confirm(
    "Are you sure you want to delete all transactions?",
  );

  if (confirmReset) {
    localStorage.removeItem("transactions");
    renderTransactions();
  }
});

// SETTINGS SAVE
settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = settingName.value.trim();
  const currency = settingCurrency.value;

  localStorage.setItem("userName", name);
  localStorage.setItem("currency", currency);

  // UPDATE TOPBAR NAME
  topbarName.textContent = name;

  // UPDATE DASHBOARD CURRENCY
  renderTransactions();

  alert("Settings saved successfully!");
});

// LOAD SAVED SETTINGS
const savedName = localStorage.getItem("userName");
const savedCurrency = localStorage.getItem("currency");

if (savedName) {
  settingName.value = savedName;
  topbarName.textContent = savedName;
}

if (savedCurrency) {
  settingCurrency.value = savedCurrency;
}

// SEARCH AND FILTER EVENTS
searchInput.addEventListener("input", renderTransactions);
typeFilter.addEventListener("change", renderTransactions);

// EDIT AND DELETE USING EVENT DELEGATION
table.addEventListener("click", (event) => {
  // EDIT TRANSACTION
  const editBtn = event.target.closest(".btn-edit");

  if (editBtn) {
    const id = Number(editBtn.dataset.id);

    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    const selectedTransaction = transactions.find((elem) => elem.id === id);

    if (!selectedTransaction) return;

    txId.value = selectedTransaction.id;
    txType.value = selectedTransaction.type;
    txDescription.value = selectedTransaction.description;
    txAmount.value = selectedTransaction.amount;
    txDate.value = selectedTransaction.date;
    txCategory.value = selectedTransaction.category;

    modalTitle.textContent = "Edit Transaction";
    modalSubmitBtn.textContent = "Update Transaction";

    modal.style.display = "flex";
  }

  // DELETE TRANSACTION
  const deleteBtn = event.target.closest(".btn-delete");

  if (deleteBtn) {
    const id = Number(deleteBtn.dataset.id);

    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    transactions = transactions.filter((elem) => elem.id !== id);

    localStorage.setItem("transactions", JSON.stringify(transactions));

    renderTransactions();
  }
});

// SIDEBAR NAVIGATION
const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view-section");

navItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();

    navItems.forEach((nav) => {
      nav.classList.remove("active");
    });

    views.forEach((view) => {
      view.classList.remove("active");
    });

    item.classList.add("active");

    const target = item.dataset.target;

    document.getElementById(target).classList.add("active");
  });
});
