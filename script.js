const pageSections =
    document.querySelectorAll(".page-section");

const navLinks =
    document.querySelectorAll(".nav-link");

const mobileNavLinks =
    document.querySelectorAll(".mobile-nav-link");


const transactionModal =
    document.getElementById("transactionModal");

const transactionForm =
    document.getElementById("transactionForm");


const addTransactionBtn =
    document.getElementById("addTransactionBtn");

const quickAddBtn =
    document.getElementById("quickAddBtn");

const emptyAddBtn =
    document.getElementById("emptyAddBtn");

const mobileAddBtn =
    document.getElementById("mobileAddBtn");


const cancelTransactionBtn =
    document.getElementById("cancelTransactionBtn");

const closeTransactionModal =
    document.getElementById("closeTransactionModal");


const transactionIdInput =
    document.getElementById("transactionId");

const amountInput =
    document.getElementById("amount");

const categoryInput =
    document.getElementById("category");

const dateInput =
    document.getElementById("date");

const descriptionInput =
    document.getElementById("description");

const notesInput =
    document.getElementById("notes");


const amountError =
    document.getElementById("amountError");

const categoryError =
    document.getElementById("categoryError");

const dateError =
    document.getElementById("dateError");

const descriptionError =
    document.getElementById("descriptionError");

const formMessage =
    document.getElementById("formMessage");


const transactionTableBody =
    document.getElementById("transactionTableBody");

const transactionResultCount =
    document.getElementById("transactionResultCount");


const typeFilter =
    document.getElementById("typeFilter");

const categoryFilter =
    document.getElementById("categoryFilter");

const dateFilter =
    document.getElementById("dateFilter");

const searchInput =
    document.getElementById("searchInput");

const clearFiltersBtn =
    document.getElementById("clearFiltersBtn");


const previousPageBtn =
    document.getElementById("previousPageBtn");

const nextPageBtn =
    document.getElementById("nextPageBtn");

const pageInfo =
    document.getElementById("pageInfo");


const deleteModal =
    document.getElementById("deleteModal");

const cancelDeleteBtn =
    document.getElementById("cancelDeleteBtn");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");


const totalIncome =
    document.getElementById("totalIncome");

const totalExpenses =
    document.getElementById("totalExpenses");

const currentBalance =
    document.getElementById("currentBalance");

const transactionCount =
    document.getElementById("transactionCount");


const incomeChange =
    document.getElementById("incomeChange");

const expenseChange =
    document.getElementById("expenseChange");

const balanceStatus =
    document.getElementById("balanceStatus");

const transactionStatus =
    document.getElementById("transactionStatus");


const savedTransactionCount =
    document.getElementById("savedTransactionCount");


const STORAGE_KEY =
    "spendwise_transactions";


let transactions = [];

let editingTransactionId = null;

let transactionToDeleteId = null;


let currentPage = 1;

const transactionsPerPage = 8;


/* =========================
   NAVIGATION
========================= */

function showSection(sectionId) {
    pageSections.forEach((section) => {
        section.classList.toggle(
            "active-section",
            section.id === sectionId
        );
    });

    navLinks.forEach((link) => {
        link.classList.toggle(
            "active",
            link.dataset.section === sectionId
        );
    });

    mobileNavLinks.forEach((link) => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") ===
                `#${sectionId}`
        );
    });

    if (sectionId === "analytics") {
        updateAnalytics();
    }
    if (sectionId === "insights") {
    updateInsights();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


navLinks.forEach((link) => {
    link.addEventListener(
        "click",
        (event) => {
            event.preventDefault();

            showSection(
                link.dataset.section
            );
        }
    );
});


mobileNavLinks.forEach((link) => {
    link.addEventListener(
        "click",
        (event) => {
            event.preventDefault();

            const sectionId =
                link
                    .getAttribute("href")
                    .replace("#", "");

            showSection(sectionId);
        }
    );
});
/* =========================
   LOCAL STORAGE
========================= */

function loadTransactions() {
    try {
        const savedData =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!savedData) {
            transactions = [];
            return;
        }

        const parsedData =
            JSON.parse(savedData);

        if (!Array.isArray(parsedData)) {
            transactions = [];
            return;
        }

        transactions = parsedData;
    } catch (error) {
        console.error(
            "Unable to load transactions:",
            error
        );

        transactions = [];

        showToast(
            "Saved transaction data could not be loaded.",
            "error"
        );
    }
}


function saveTransactions() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(transactions)
        );

        return true;
    } catch (error) {
        console.error(
            "Unable to save transactions:",
            error
        );

        showToast(
            "Unable to save transaction data.",
            "error"
        );

        return false;
    }
}


/* =========================
   MODAL
========================= */

function openTransactionModal(
    transaction = null
) {
    if (!transactionModal) {
        return;
    }

    transactionForm.reset();

    clearValidationErrors();

    if (transaction) {
        editingTransactionId =
            transaction.id;

        transactionIdInput.value =
            transaction.id;

        amountInput.value =
            transaction.amount;

        categoryInput.value =
            transaction.category;

        dateInput.value =
            transaction.date;

        descriptionInput.value =
            transaction.description;

        notesInput.value =
            transaction.notes || "";

        const selectedType =
            document.querySelector(
                `input[name="transactionType"][value="${transaction.type}"]`
            );

        if (selectedType) {
            selectedType.checked = true;
        }

        setModalTitle(
            "Edit Transaction"
        );
    } else {
        editingTransactionId = null;

        transactionIdInput.value = "";

        dateInput.value =
            new Date()
                .toISOString()
                .split("T")[0];

        const incomeRadio =
            document.querySelector(
                'input[name="transactionType"][value="income"]'
            );

        if (incomeRadio) {
            incomeRadio.checked = true;
        }

        setModalTitle(
            "Add Transaction"
        );
    }

    transactionModal.classList.add(
        "show"
    );

    transactionModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

    setTimeout(() => {
        amountInput.focus();
    }, 100);
}


function setModalTitle(title) {
    const titleElement =
        document.getElementById(
            "transactionModalTitle"
        );

    if (titleElement) {
        titleElement.textContent =
            title;
    }

    const eyebrow =
        document.getElementById(
            "modalEyebrow"
        );

    if (eyebrow) {
        eyebrow.textContent =
            title === "Edit Transaction"
                ? "EDIT TRANSACTION"
                : "TRANSACTION";
    }
}


function closeTransactionModalWindow() {
    if (!transactionModal) {
        return;
    }

    transactionModal.classList.remove(
        "show"
    );

    transactionModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

    transactionForm.reset();

    transactionIdInput.value = "";

    editingTransactionId = null;

    clearValidationErrors();
}


function openDeleteModal(transactionId) {
    if (!deleteModal) {
        return;
    }

    transactionToDeleteId =
        transactionId;

    deleteModal.classList.add(
        "show"
    );

    deleteModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );
}


function closeDeleteModal() {
    if (!deleteModal) {
        return;
    }

    deleteModal.classList.remove(
        "show"
    );

    deleteModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

    transactionToDeleteId = null;
}


/* =========================
   FORM VALIDATION
========================= */

function getSelectedTransactionType() {
    const selectedType =
        document.querySelector(
            'input[name="transactionType"]:checked'
        );

    return selectedType
        ? selectedType.value
        : "income";
}


function clearValidationErrors() {
    amountError.textContent = "";

    categoryError.textContent = "";

    dateError.textContent = "";

    descriptionError.textContent = "";

    amountInput.classList.remove(
        "input-error"
    );

    categoryInput.classList.remove(
        "input-error"
    );

    dateInput.classList.remove(
        "input-error"
    );

    descriptionInput.classList.remove(
        "input-error"
    );

    formMessage.textContent = "";

    formMessage.className =
        "form-message";
}


function validateTransactionForm() {
    clearValidationErrors();

    let isValid = true;

    const amount =
        Number(amountInput.value);

    const category =
        categoryInput.value;

    const date =
        dateInput.value;

    const description =
        descriptionInput.value.trim();


    if (
        !amountInput.value ||
        Number.isNaN(amount) ||
        amount <= 0
    ) {
        amountError.textContent =
            "Enter an amount greater than 0.";

        amountInput.classList.add(
            "input-error"
        );

        isValid = false;
    }


    if (!category) {
        categoryError.textContent =
            "Please select a category.";

        categoryInput.classList.add(
            "input-error"
        );

        isValid = false;
    }


    if (!date) {
        dateError.textContent =
            "Please select a date.";

        dateInput.classList.add(
            "input-error"
        );

        isValid = false;
    }


    if (!description) {
        descriptionError.textContent =
            "Please enter a description.";

        descriptionInput.classList.add(
            "input-error"
        );

        isValid = false;
    }


    if (!isValid) {
        formMessage.textContent =
            "Please correct the highlighted fields.";

        formMessage.classList.add(
            "error"
        );
    }

    return isValid;
}


/* =========================
   TRANSACTION OBJECT
========================= */

function generateTransactionId() {
    if (
        window.crypto &&
        typeof crypto.randomUUID ===
            "function"
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}


function createTransactionObject() {
    return {
        id: generateTransactionId(),

        type:
            getSelectedTransactionType(),

        amount:
            Number(amountInput.value),

        category:
            categoryInput.value,

        date:
            dateInput.value,

        description:
            descriptionInput.value.trim(),

        notes:
            notesInput.value.trim(),

        createdAt:
            new Date().toISOString()
    };
}


/* =========================
   FORM SUBMIT
========================= */

transactionForm.addEventListener(
    "submit",
    (event) => {
        event.preventDefault();

        if (!validateTransactionForm()) {
            return;
        }

        if (editingTransactionId) {
            updateExistingTransaction();
        } else {
            addNewTransaction();
        }

        closeTransactionModalWindow();

        renderTransactions();

        updateDashboard();

        updateAnalytics();
    }
);


function addNewTransaction() {
    const transaction =
        createTransactionObject();

    transactions.unshift(
        transaction
    );

    saveTransactions();

    updateCategoryFilter();

    showToast(
        "Transaction added successfully.",
        "success"
    );
}


function updateExistingTransaction() {
    const index =
        transactions.findIndex(
            (transaction) =>
                transaction.id ===
                editingTransactionId
        );

    if (index === -1) {
        showToast(
            "Transaction could not be found.",
            "error"
        );

        return;
    }

    const existingTransaction =
        transactions[index];

    transactions[index] = {
        ...existingTransaction,

        type:
            getSelectedTransactionType(),

        amount:
            Number(amountInput.value),

        category:
            categoryInput.value,

        date:
            dateInput.value,

        description:
            descriptionInput.value.trim(),

        notes:
            notesInput.value.trim()
    };

    saveTransactions();

    updateCategoryFilter();

    showToast(
        "Transaction updated successfully.",
        "success"
    );
}


/* =========================
   DELETE
========================= */

function deleteTransaction() {
    if (!transactionToDeleteId) {
        return;
    }

    const previousLength =
        transactions.length;

    transactions =
        transactions.filter(
            (transaction) =>
                transaction.id !==
                transactionToDeleteId
        );

    if (
        transactions.length ===
        previousLength
    ) {
        closeDeleteModal();

        showToast(
            "Transaction could not be found.",
            "error"
        );

        return;
    }

    saveTransactions();

    currentPage = 1;

    updateCategoryFilter();

    closeDeleteModal();

    renderTransactions();

    updateDashboard();

    updateAnalytics();

    showToast(
        "Transaction deleted successfully.",
        "success"
    );
}


/* =========================
   FORMATTING
========================= */

function formatCurrency(amount) {
    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }
    ).format(amount);
}


function formatDate(dateString) {
    if (!dateString) {
        return "-";
    }

    const date =
        new Date(
            `${dateString}T00:00:00`
        );

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================
   FILTERING
========================= */

function getFilteredTransactions() {
    const selectedType =
        typeFilter
            ? typeFilter.value
            : "all";

    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
            : "all";

    const selectedDate =
        dateFilter
            ? dateFilter.value
            : "";

    const searchTerm =
        searchInput
            ? searchInput.value
                  .trim()
                  .toLowerCase()
            : "";

    return transactions
        .filter((transaction) => {
            if (
                selectedType !== "all" &&
                transaction.type !==
                    selectedType
            ) {
                return false;
            }

            if (
                selectedCategory !== "all" &&
                transaction.category !==
                    selectedCategory
            ) {
                return false;
            }

            if (
                selectedDate &&
                transaction.date !==
                    selectedDate
            ) {
                return false;
            }

            if (searchTerm) {
                const description =
                    (
                        transaction.description ||
                        ""
                    ).toLowerCase();

                const category =
                    (
                        transaction.category ||
                        ""
                    ).toLowerCase();

                const notes =
                    (
                        transaction.notes ||
                        ""
                    ).toLowerCase();

                const matchesSearch =
                    description.includes(
                        searchTerm
                    ) ||
                    category.includes(
                        searchTerm
                    ) ||
                    notes.includes(
                        searchTerm
                    );

                if (!matchesSearch) {
                    return false;
                }
            }

            return true;
        })
        .sort((a, b) => {
            const dateDifference =
                new Date(b.date) -
                new Date(a.date);

            if (dateDifference !== 0) {
                return dateDifference;
            }

            return (
                new Date(
                    b.createdAt || 0
                ) -
                new Date(
                    a.createdAt || 0
                )
            );
        });
}


/* =========================
   CATEGORY FILTER
========================= */

function updateCategoryFilter() {
    if (!categoryFilter) {
        return;
    }

    const currentValue =
        categoryFilter.value;

    const categories = [
        ...new Set(
            transactions
                .map(
                    (transaction) =>
                        transaction.category
                )
                .filter(Boolean)
        )
    ].sort();

    categoryFilter.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;

    categories.forEach(
        (category) => {
            const option =
                document.createElement(
                    "option"
                );

            option.value = category;

            option.textContent =
                category;

            categoryFilter.appendChild(
                option
            );
        }
    );

    if (
        categories.includes(
            currentValue
        )
    ) {
        categoryFilter.value =
            currentValue;
    } else {
        categoryFilter.value =
            "all";
    }
}


/* =========================
   TRANSACTION TABLE
========================= */

function renderTransactions() {
    if (!transactionTableBody) {
        return;
    }

    const filteredTransactions =
        getFilteredTransactions();

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredTransactions.length /
                    transactionsPerPage
            )
        );

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIndex =
        (currentPage - 1) *
        transactionsPerPage;

    const endIndex =
        startIndex +
        transactionsPerPage;

    const pageTransactions =
        filteredTransactions.slice(
            startIndex,
            endIndex
        );

    transactionTableBody.innerHTML =
        "";

    if (
        pageTransactions.length === 0
    ) {
        const hasFilters =
            (
                typeFilter &&
                typeFilter.value !==
                    "all"
            ) ||
            (
                categoryFilter &&
                categoryFilter.value !==
                    "all"
            ) ||
            (
                dateFilter &&
                dateFilter.value
            ) ||
            (
                searchInput &&
                searchInput.value.trim()
            );

        transactionTableBody.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="6">
                    <div class="empty-state">

                        <div class="empty-state-icon">
                            ₹
                        </div>

                        <h3>
                            ${
                                hasFilters
                                    ? "No transactions found"
                                    : "Your wallet is quiet"
                            }
                        </h3>

                        <p>
                            ${
                                hasFilters
                                    ? "Try changing your filters or search term."
                                    : "Start by adding your first income or expense transaction."
                            }
                        </p>

                        ${
                            !hasFilters
                                ? `
                                    <button
                                        class="primary-btn small-btn"
                                        id="tableEmptyAddBtn"
                                        type="button"
                                    >
                                        + Add Transaction
                                    </button>
                                `
                                : ""
                        }

                    </div>
                </td>
            </tr>
        `;

        const tableEmptyAddBtn =
            document.getElementById(
                "tableEmptyAddBtn"
            );

        if (tableEmptyAddBtn) {
            tableEmptyAddBtn.addEventListener(
                "click",
                () =>
                    openTransactionModal()
            );
        }
    } else {
        pageTransactions.forEach(
            (transaction) => {
                const row =
                    document.createElement(
                        "tr"
                    );

                const typeClass =
                    transaction.type ===
                    "income"
                        ? "income"
                        : "expense";

                const amountPrefix =
                    transaction.type ===
                    "income"
                        ? "+"
                        : "-";

                row.innerHTML = `
                    <td>
                        ${formatDate(
                            transaction.date
                        )}
                    </td>

                    <td>
                        <div class="transaction-description">

                            <strong>
                                ${escapeHTML(
                                    transaction.description
                                )}
                            </strong>

                            ${
                                transaction.notes
                                    ? `
                                        <span class="transaction-note">
                                            ${escapeHTML(
                                                transaction.notes
                                            )}
                                        </span>
                                    `
                                    : ""
                            }

                        </div>
                    </td>

                    <td>
                        <span class="category-badge">
                            ${escapeHTML(
                                transaction.category
                            )}
                        </span>
                    </td>

                    <td>
                        <span class="type-badge ${typeClass}">
                            ${
                                transaction.type ===
                                "income"
                                    ? "Income"
                                    : "Expense"
                            }
                        </span>
                    </td>

                    <td>
                        <strong
                            class="${
                                transaction.type ===
                                "income"
                                    ? "amount-income"
                                    : "amount-expense"
                            }"
                        >
                            ${amountPrefix}${formatCurrency(
                                transaction.amount
                            )}
                        </strong>
                    </td>

                    <td>
                        <div class="action-buttons">

                            <button
                                type="button"
                                class="table-action-btn"
                                data-action="edit"
                                data-id="${transaction.id}"
                                title="Edit transaction"
                            >
                                ✎
                            </button>

                            <button
                                type="button"
                                class="table-action-btn delete"
                                data-action="delete"
                                data-id="${transaction.id}"
                                title="Delete transaction"
                            >
                                ×
                            </button>

                        </div>
                    </td>
                `;

                transactionTableBody.appendChild(
                    row
                );
            }
        );
    }

    if (transactionResultCount) {
        transactionResultCount.textContent =
            `Showing ${
                filteredTransactions.length
            } transaction${
                filteredTransactions.length ===
                1
                    ? ""
                    : "s"
            }`;
    }

    if (pageInfo) {
        pageInfo.textContent =
            `Page ${currentPage} of ${totalPages}`;
    }

    if (previousPageBtn) {
        previousPageBtn.disabled =
            currentPage === 1;
    }

    if (nextPageBtn) {
        nextPageBtn.disabled =
            currentPage >= totalPages;
    }
}


/* =========================
   DASHBOARD TOTALS
========================= */

function updateDashboard() {
    const income =
        transactions
            .filter(
                (transaction) =>
                    transaction.type ===
                    "income"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(
                        transaction.amount ||
                            0
                    ),
                0
            );

    const expenses =
        transactions
            .filter(
                (transaction) =>
                    transaction.type ===
                    "expense"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(
                        transaction.amount ||
                            0
                    ),
                0
            );

    const balance =
        income - expenses;


    if (totalIncome) {
        totalIncome.textContent =
            formatCurrency(income);
    }

    if (totalExpenses) {
        totalExpenses.textContent =
            formatCurrency(expenses);
    }

    if (currentBalance) {
        currentBalance.textContent =
            formatCurrency(balance);
    }

    if (transactionCount) {
        transactionCount.textContent =
            transactions.length;
    }

    if (savedTransactionCount) {
        savedTransactionCount.textContent =
            transactions.length;
    }


    const incomeCount =
        transactions.filter(
            (transaction) =>
                transaction.type ===
                "income"
        ).length;

    const expenseCount =
        transactions.filter(
            (transaction) =>
                transaction.type ===
                "expense"
        ).length;


    if (transactions.length === 0) {
        if (incomeChange) {
            incomeChange.textContent =
                "No transactions yet";

            incomeChange.className =
                "summary-change neutral";
        }

        if (expenseChange) {
            expenseChange.textContent =
                "No transactions yet";

            expenseChange.className =
                "summary-change neutral";
        }

        if (balanceStatus) {
            balanceStatus.textContent =
                "Add transactions to begin";

            balanceStatus.className =
                "summary-change neutral";
        }

        if (transactionStatus) {
            transactionStatus.textContent =
                "No activity recorded";

            transactionStatus.className =
                "summary-change neutral";
        }

        return;
    }


    if (incomeChange) {
        incomeChange.textContent =
            `${incomeCount} income transaction${
                incomeCount === 1
                    ? ""
                    : "s"
            }`;

        incomeChange.className =
            "summary-change positive";
    }


    if (expenseChange) {
        expenseChange.textContent =
            `${expenseCount} expense transaction${
                expenseCount === 1
                    ? ""
                    : "s"
            }`;

        expenseChange.className =
            "summary-change negative";
    }


    if (balanceStatus) {
        balanceStatus.textContent =
            balance >= 0
                ? "You are currently in positive balance"
                : "Expenses are higher than income";

        balanceStatus.className =
            balance >= 0
                ? "summary-change positive"
                : "summary-change negative";
    }


    if (transactionStatus) {
        transactionStatus.textContent =
            `${transactions.length} transaction${
                transactions.length === 1
                    ? ""
                    : "s"
            } recorded`;

        transactionStatus.className =
            "summary-change neutral";
    }
    updateDashboardInsights();
}
/* =========================
   DASHBOARD INSIGHTS
========================= */

function updateDashboardInsights() {

    const healthScore = document.getElementById("healthScore");
    const healthBadge = document.getElementById("healthBadge");
    const healthTitle = document.getElementById("healthTitle");
    const healthMessage = document.getElementById("healthMessage");
    const savingsRate = document.getElementById("savingsRate");
    const expenseRatio = document.getElementById("expenseRatio");
    const dailyAverage = document.getElementById("dailyAverage");

    const topCategory = document.getElementById("topCategory");
    const topCategoryAmount = document.getElementById("topCategoryAmount");
    const highestExpense = document.getElementById("highestExpense");
    const averageExpense = document.getElementById("averageExpense");
    const insightMessage = document.getElementById("insightMessage");

    if (!transactions.length) {
        return;
    }

    /* =========================
       BASIC FINANCIAL TOTALS
    ========================= */

    const incomeTransactions = transactions.filter(
        (transaction) =>
            transaction.type === "income"
    );

    const expenseTransactions = transactions.filter(
        (transaction) =>
            transaction.type === "expense"
    );

    const income = incomeTransactions.reduce(
        (total, transaction) =>
            total + Number(transaction.amount || 0),
        0
    );

    const expenses = expenseTransactions.reduce(
        (total, transaction) =>
            total + Number(transaction.amount || 0),
        0
    );

    const balance = income - expenses;


    /* =========================
       FINANCIAL HEALTH
    ========================= */

    const calculatedSavingsRate =
        income > 0
            ? (balance / income) * 100
            : 0;

    const calculatedExpenseRatio =
        income > 0
            ? (expenses / income) * 100
            : 0;

    const safeSavingsRate = Math.max(
        0,
        Math.min(100, calculatedSavingsRate)
    );

    const safeExpenseRatio = Math.max(
        0,
        Math.min(100, calculatedExpenseRatio)
    );

    /*
       Health score is based primarily
       on the percentage of income saved.
    */

    const score = Math.round(
        safeSavingsRate
    );


    if (healthScore) {
        healthScore.textContent = score;
    }

    if (savingsRate) {
        savingsRate.textContent =
            `${safeSavingsRate.toFixed(0)}%`;
    }

    if (expenseRatio) {
        expenseRatio.textContent =
            `${safeExpenseRatio.toFixed(0)}%`;
    }


    /* =========================
       DAILY EXPENSE AVERAGE
    ========================= */

    const now = new Date();

    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth();

    const daysElapsed =
        now.getDate();

    const currentMonthExpenses =
        expenseTransactions.filter(
            (transaction) => {

                const transactionDate =
                    new Date(
                        `${transaction.date}T00:00:00`
                    );

                return (
                    transactionDate.getFullYear() ===
                        currentYear &&
                    transactionDate.getMonth() ===
                        currentMonth
                );
            }
        );

    const currentMonthExpenseTotal =
        currentMonthExpenses.reduce(
            (total, transaction) =>
                total +
                Number(transaction.amount || 0),
            0
        );

    const dailyExpenseAverage =
        daysElapsed > 0
            ? currentMonthExpenseTotal / daysElapsed
            : 0;

    if (dailyAverage) {
        dailyAverage.textContent =
            formatCurrency(
                dailyExpenseAverage
            );
    }


    /* =========================
       HEALTH STATUS
    ========================= */

    let healthStatus = "Needs attention";
    let healthTitleText = "Review your spending";
    let healthMessageText =
        "Your expenses are currently taking a significant share of your income.";

    if (score >= 80) {

        healthStatus = "Excellent";
        healthTitleText = "Strong financial health";
        healthMessageText =
            "You are maintaining a strong balance between income and spending.";

    } else if (score >= 60) {

        healthStatus = "Good";
        healthTitleText = "Good financial health";
        healthMessageText =
            "You are maintaining a healthy positive balance.";

    } else if (score >= 40) {

        healthStatus = "Moderate";
        healthTitleText = "Room to improve";
        healthMessageText =
            "Your finances are positive, but reducing unnecessary spending could help.";

    } else if (score > 0) {

        healthStatus = "Needs attention";
        healthTitleText = "Review your spending";
        healthMessageText =
            "Consider reducing expenses and increasing your savings.";

    } else {

        healthStatus = "Critical";
        healthTitleText = "Expenses exceed income";
        healthMessageText =
            "Your current expenses are higher than your recorded income.";
    }


    if (healthBadge) {
        healthBadge.textContent =
            healthStatus;
    }

    if (healthTitle) {
        healthTitle.textContent =
            healthTitleText;
    }

    if (healthMessage) {
        healthMessage.textContent =
            healthMessageText;
    }


    /* =========================
       TOP SPENDING CATEGORY
    ========================= */

    const categoryTotals = {};

    expenseTransactions.forEach(
        (transaction) => {

            const category =
                String(
                    transaction.category || "Other"
                ).trim();

            const amount =
                Number(
                    transaction.amount || 0
                );

            categoryTotals[category] =
                (categoryTotals[category] || 0) +
                amount;
        }
    );

    const categoryEntries =
        Object.entries(categoryTotals);

    categoryEntries.sort(
        (a, b) =>
            b[1] - a[1]
    );

    if (categoryEntries.length > 0) {

        const [
            highestCategory,
            highestCategoryAmount
        ] = categoryEntries[0];

        if (topCategory) {
            topCategory.textContent =
                highestCategory;
        }

        if (topCategoryAmount) {
            topCategoryAmount.textContent =
                `${formatCurrency(
                    highestCategoryAmount
                )} spent`;
        }

    } else {

        if (topCategory) {
            topCategory.textContent =
                "No data";
        }

        if (topCategoryAmount) {
            topCategoryAmount.textContent =
                "₹0.00 spent";
        }
    }


    /* =========================
       HIGHEST + AVERAGE EXPENSE
    ========================= */

    const expenseAmounts =
        expenseTransactions.map(
            (transaction) =>
                Number(
                    transaction.amount || 0
                )
        );

    const highestExpenseAmount =
        expenseAmounts.length > 0
            ? Math.max(...expenseAmounts)
            : 0;

    const averageExpenseAmount =
        expenseAmounts.length > 0
            ? expenses /
              expenseAmounts.length
            : 0;


    if (highestExpense) {
        highestExpense.textContent =
            formatCurrency(
                highestExpenseAmount
            );
    }

    if (averageExpense) {
        averageExpense.textContent =
            formatCurrency(
                averageExpenseAmount
            );
    }


    /* =========================
       PERSONALIZED INSIGHT
    ========================= */

    let message =
        "Keep recording transactions to build a useful spending history.";

    if (
        expenseTransactions.length > 0 &&
        categoryEntries.length > 0
    ) {

        const topCategoryName =
            categoryEntries[0][0];

        const topCategoryValue =
            categoryEntries[0][1];

        const spendingPercentage =
            expenses > 0
                ? (
                    topCategoryValue /
                    expenses
                ) * 100
                : 0;

        message =
            `${topCategoryName} is your largest spending category, accounting for ${spendingPercentage.toFixed(0)}% of your recorded expenses.`;

    }

    if (balance < 0) {

        message =
            "Your recorded expenses are higher than your income. Consider reviewing your largest spending categories.";

    } else if (
        balance >= 0 &&
        safeSavingsRate >= 50 &&
        expenseTransactions.length > 0
    ) {

        message =
            "You are maintaining a strong positive balance. Keep monitoring your spending to maintain this trend.";
    }


    if (insightMessage) {
        insightMessage.textContent =
            message;
    }
    updateDashboardCharts();
    updateInsights();
}



/* =========================
   DASHBOARD CHARTS
========================= */

function updateDashboardCharts() {

    if (typeof Chart === "undefined") {
        console.warn(
            "Chart.js is not loaded."
        );
        return;
    }


    /* =========================
       GET ELEMENTS
    ========================= */

    const expenseTrendCanvas =
        document.getElementById(
            "expenseTrendChart"
        );

    const trendEmpty =
        document.getElementById(
            "trendEmpty"
        );

    const categoryCanvas =
        document.getElementById(
            "categoryChart"
        );

    const categoryEmpty =
        document.getElementById(
            "categoryEmpty"
        );

    const categoryLegend =
        document.getElementById(
            "categoryLegend"
        );


    if (!expenseTrendCanvas ||
        !categoryCanvas) {

        return;
    }


    /* =========================
       CURRENT MONTH EXPENSES
    ========================= */

    const now = new Date();

    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth();

    const currentMonthExpenses =
        transactions.filter(
            (transaction) => {

                if (
                    transaction.type !==
                    "expense"
                ) {
                    return false;
                }

                const transactionDate =
                    new Date(
                        `${transaction.date}T00:00:00`
                    );

                return (
                    !isNaN(
                        transactionDate.getTime()
                    ) &&
                    transactionDate.getFullYear() ===
                        currentYear &&
                    transactionDate.getMonth() ===
                        currentMonth
                );
            }
        );


    /* =========================
       EXPENSE TREND
    ========================= */

    const dailyExpenses = {};

    currentMonthExpenses.forEach(
        (transaction) => {

            const date =
                transaction.date;

            if (!dailyExpenses[date]) {
                dailyExpenses[date] = 0;
            }

            dailyExpenses[date] +=
                Number(
                    transaction.amount || 0
                );
        }
    );


    const trendDates =
        Object.keys(
            dailyExpenses
        ).sort();

    const trendValues =
        trendDates.map(
            (date) =>
                dailyExpenses[date]
        );


    const hasTrendData =
        trendDates.length > 0;


    if (trendEmpty) {

        trendEmpty.style.display =
            hasTrendData
                ? "none"
                : "flex";
    }


    expenseTrendCanvas.style.display =
        hasTrendData
            ? "block"
            : "none";


    /*
       Destroy an existing chart
       attached to this canvas.
    */

    const existingTrendChart =
        Chart.getChart(
            expenseTrendCanvas
        );

    if (existingTrendChart) {
        existingTrendChart.destroy();
    }


    if (hasTrendData) {

        const trendLabels =
            trendDates.map(
                (date) => {

                    const parsedDate =
                        new Date(
                            `${date}T00:00:00`
                        );

                    return parsedDate.toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short"
                        }
                    );
                }
            );


        new Chart(
            expenseTrendCanvas.getContext("2d"),
            {
                type: "line",

                data: {
                    labels: trendLabels,

                    datasets: [
                        {
                            label:
                                "Daily Expenses",

                            data:
                                trendValues,

                            borderWidth: 2,

                            tension: 0.35,

                            fill: true,

                            pointRadius: 4,

                            pointHoverRadius: 6
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {
                        intersect: false,
                        mode: "index"
                    },

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    (context) =>
                                        ` ${formatCurrency(
                                            context.raw
                                        )}`
                            }
                        }
                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    (value) =>
                                        formatCurrency(
                                            value
                                        )
                            }
                        }
                    }
                }
            }
        );
    }


    /* =========================
       CATEGORY BREAKDOWN
    ========================= */

    const categoryTotals = {};


    currentMonthExpenses.forEach(
        (transaction) => {

            const category =
                String(
                    transaction.category ||
                    "Other"
                ).trim();

            const amount =
                Number(
                    transaction.amount || 0
                );

            categoryTotals[category] =
                (
                    categoryTotals[category] ||
                    0
                ) + amount;
        }
    );


    const categoryEntries =
        Object.entries(
            categoryTotals
        ).sort(
            (a, b) =>
                b[1] - a[1]
        );


    const hasCategoryData =
        categoryEntries.length > 0;


    if (categoryEmpty) {

        categoryEmpty.style.display =
            hasCategoryData
                ? "none"
                : "flex";
    }


    categoryCanvas.style.display =
        hasCategoryData
            ? "block"
            : "none";


    const existingCategoryChart =
        Chart.getChart(
            categoryCanvas
        );

    if (existingCategoryChart) {
        existingCategoryChart.destroy();
    }


    if (categoryLegend) {

        categoryLegend.innerHTML = "";
    }


    if (!hasCategoryData) {
        return;
    }


    const categoryLabels =
        categoryEntries.map(
            ([category]) =>
                category
        );


    const categoryValues =
        categoryEntries.map(
            ([, amount]) =>
                amount
        );


    /* =========================
       CATEGORY CHART
    ========================= */

    new Chart(
        categoryCanvas.getContext("2d"),
        {
            type: "doughnut",

            data: {

                labels:
                    categoryLabels,

                datasets: [
                    {
                        data:
                            categoryValues,

                        borderWidth: 2
                    }
                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "62%",

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        callbacks: {

                            label:
                                (context) => {

                                    const value =
                                        context.raw;

                                    return ` ${formatCurrency(
                                        value
                                    )}`;
                                }
                        }
                    }
                }
            }
        }
    );


    /* =========================
       CATEGORY LEGEND
    ========================= */

    if (categoryLegend) {

        categoryEntries.forEach(
            ([category, amount]) => {

                const legendItem =
                    document.createElement(
                        "div"
                    );

                legendItem.className =
                    "category-legend-item";


                const label =
                    document.createElement(
                        "span"
                    );

                label.textContent =
                    category;


                const value =
                    document.createElement(
                        "strong"
                    );

                value.textContent =
                    formatCurrency(
                        amount
                    );


                legendItem.appendChild(
                    label
                );

                legendItem.appendChild(
                    value
                );

                categoryLegend.appendChild(
                    legendItem
                );
            }
        );
    }
}



/* =========================
   MONEY INSIGHTS PAGE
========================= */

function updateInsights() {

    const insightTopCategory =
        document.getElementById("insightTopCategory");

    const insightTopCategoryText =
        document.getElementById("insightTopCategoryText");

    const insightSpendingRate =
        document.getElementById("insightSpendingRate");

    const insightSpendingRateText =
        document.getElementById("insightSpendingRateText");

    const insightHighestExpense =
        document.getElementById("insightHighestExpense");

    const insightHighestExpenseText =
        document.getElementById("insightHighestExpenseText");

    const insightFinancialStatus =
        document.getElementById("insightFinancialStatus");

    const insightFinancialStatusText =
        document.getElementById("insightFinancialStatusText");

    const recommendationTitle =
        document.getElementById("recommendationTitle");

    const recommendationText =
        document.getElementById("recommendationText");


    /* =========================
       TRANSACTION TOTALS
    ========================= */

    const incomeTransactions =
        transactions.filter(
            (transaction) =>
                transaction.type === "income"
        );

    const expenseTransactions =
        transactions.filter(
            (transaction) =>
                transaction.type === "expense"
        );


    const totalIncome =
        incomeTransactions.reduce(
            (total, transaction) =>
                total +
                Number(transaction.amount || 0),
            0
        );


    const totalExpenses =
        expenseTransactions.reduce(
            (total, transaction) =>
                total +
                Number(transaction.amount || 0),
            0
        );


    const balance =
        totalIncome - totalExpenses;


    /* =========================
       NO DATA
    ========================= */

    if (expenseTransactions.length === 0) {

        if (insightTopCategory) {
            insightTopCategory.textContent =
                "No data";
        }

        if (insightTopCategoryText) {
            insightTopCategoryText.textContent =
                "Your top spending category will appear here.";
        }

        if (insightSpendingRate) {
            insightSpendingRate.textContent =
                "0%";
        }

        if (insightSpendingRateText) {
            insightSpendingRateText.textContent =
                "Add transactions to calculate your spending rate.";
        }

        if (insightHighestExpense) {
            insightHighestExpense.textContent =
                "₹0.00";
        }

        if (insightHighestExpenseText) {
            insightHighestExpenseText.textContent =
                "Your highest individual expense will appear here.";
        }

        if (insightFinancialStatus) {
            insightFinancialStatus.textContent =
                "Waiting";
        }

        if (insightFinancialStatusText) {
            insightFinancialStatusText.textContent =
                "Your financial status will be calculated from your activity.";
        }

        if (recommendationTitle) {
            recommendationTitle.textContent =
                "Start building your financial history";
        }

        if (recommendationText) {
            recommendationText.textContent =
                "Once you add transactions, SpendWise will analyze your spending patterns and provide a simple recommendation.";
        }

        return;
    }


    /* =========================
       TOP CATEGORY
    ========================= */

    const categoryTotals = {};

    expenseTransactions.forEach(
        (transaction) => {

            const category =
                String(
                    transaction.category ||
                    "Other"
                ).trim();

            const amount =
                Number(
                    transaction.amount || 0
                );

            categoryTotals[category] =
                (categoryTotals[category] || 0) +
                amount;
        }
    );


    const categoryEntries =
        Object.entries(
            categoryTotals
        ).sort(
            (a, b) =>
                b[1] - a[1]
        );


    const topCategory =
        categoryEntries[0]?.[0] ||
        "Other";

    const topCategoryAmount =
        categoryEntries[0]?.[1] ||
        0;


    if (insightTopCategory) {
        insightTopCategory.textContent =
            topCategory;
    }


    if (insightTopCategoryText) {

        insightTopCategoryText.textContent =
            `${formatCurrency(
                topCategoryAmount
            )} is your highest spending category.`;
    }


    /* =========================
       SPENDING RATE
    ========================= */

    const spendingRate =
        totalIncome > 0
            ? (totalExpenses / totalIncome) * 100
            : 0;


    if (insightSpendingRate) {

        insightSpendingRate.textContent =
            `${spendingRate.toFixed(0)}%`;
    }


    if (insightSpendingRateText) {

        if (totalIncome > 0) {

            insightSpendingRateText.textContent =
                `You spent ${formatCurrency(
                    totalExpenses
                )} from ${formatCurrency(
                    totalIncome
                )} income.`;

        } else {

            insightSpendingRateText.textContent =
                "Add income transactions to calculate your spending rate.";
        }
    }


    /* =========================
       HIGHEST EXPENSE
    ========================= */

    const highestExpense =
        Math.max(
            ...expenseTransactions.map(
                (transaction) =>
                    Number(
                        transaction.amount || 0
                    )
            )
        );


    if (insightHighestExpense) {

        insightHighestExpense.textContent =
            formatCurrency(
                highestExpense
            );
    }


    if (insightHighestExpenseText) {

        insightHighestExpenseText.textContent =
            `Your largest recorded expense is ${formatCurrency(
                highestExpense
            )}.`;
    }


    /* =========================
       FINANCIAL STATUS
    ========================= */

    const savingsRate =
        totalIncome > 0
            ? (balance / totalIncome) * 100
            : 0;


    let financialStatus;
    let financialStatusText;


    if (totalIncome <= 0) {

        financialStatus =
            "Needs attention";

        financialStatusText =
            "Add income transactions to evaluate your financial position.";

    } else if (balance < 0) {

        financialStatus =
            "Needs attention";

        financialStatusText =
            "Your recorded expenses are currently higher than your income.";

    } else if (savingsRate >= 50) {

        financialStatus =
            "Excellent";

        financialStatusText =
            `You have a strong positive balance of ${formatCurrency(
                balance
            )}.`;

    } else if (savingsRate >= 25) {

        financialStatus =
            "Good";

        financialStatusText =
            `Your finances are currently positive with a balance of ${formatCurrency(
                balance
            )}.`;

    } else {

        financialStatus =
            "Moderate";

        financialStatusText =
            `Your balance is positive, but there is room to improve your savings rate.`;
    }


    if (insightFinancialStatus) {

        insightFinancialStatus.textContent =
            financialStatus;
    }


    if (insightFinancialStatusText) {

        insightFinancialStatusText.textContent =
            financialStatusText;
    }


    /* =========================
       PERSONALIZED RECOMMENDATION
    ========================= */

    if (recommendationTitle) {

        recommendationTitle.textContent =
            `Your biggest spending area is ${topCategory}`;
    }


    if (recommendationText) {

        if (savingsRate >= 50) {

            recommendationText.textContent =
                `Your savings rate is ${savingsRate.toFixed(
                    0
                )}%. You are maintaining a strong positive balance. Keep monitoring your ${topCategory.toLowerCase()} spending to maintain this trend.`;

        } else if (savingsRate >= 25) {

            recommendationText.textContent =
                `Your finances are currently positive. Consider keeping your ${topCategory.toLowerCase()} spending under control to improve your savings rate.`;

        } else if (balance >= 0) {

            recommendationText.textContent =
                `Your balance is positive, but your spending rate is relatively high. Review your ${topCategory.toLowerCase()} expenses for possible savings.`;

        } else {

            recommendationText.textContent =
                "Your expenses are currently higher than your income. Review your largest spending categories and reduce unnecessary expenses.";
        }
    }
}



/* =========================
   FILTER EVENTS
========================= */

[
    typeFilter,
    categoryFilter,
    dateFilter
]
    .filter(Boolean)
    .forEach((element) => {
        element.addEventListener(
            "change",
            () => {
                currentPage = 1;

                renderTransactions();
            }
        );
    });


if (searchInput) {
    searchInput.addEventListener(
        "input",
        () => {
            currentPage = 1;

            renderTransactions();
        }
    );
}


if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener(
        "click",
        () => {
            if (typeFilter) {
                typeFilter.value =
                    "all";
            }

            if (categoryFilter) {
                categoryFilter.value =
                    "all";
            }

            if (dateFilter) {
                dateFilter.value = "";
            }

            if (searchInput) {
                searchInput.value = "";
            }

            currentPage = 1;

            renderTransactions();

            showToast(
                "Filters cleared.",
                "success"
            );
        }
    );
}


/* =========================
   PAGINATION
========================= */

if (previousPageBtn) {
    previousPageBtn.addEventListener(
        "click",
        () => {
            if (currentPage > 1) {
                currentPage--;

                renderTransactions();
            }
        }
    );
}


if (nextPageBtn) {
    nextPageBtn.addEventListener(
        "click",
        () => {
            const filteredTransactions =
                getFilteredTransactions();

            const totalPages =
                Math.max(
                    1,
                    Math.ceil(
                        filteredTransactions.length /
                            transactionsPerPage
                    )
                );

            if (
                currentPage <
                totalPages
            ) {
                currentPage++;

                renderTransactions();
            }
        }
    );
}


/* =========================
   TABLE ACTIONS
========================= */

if (transactionTableBody) {
    transactionTableBody.addEventListener(
        "click",
        (event) => {
            const button =
                event.target.closest(
                    "button[data-action]"
                );

            if (!button) {
                return;
            }

            const action =
                button.dataset.action;

            const transactionId =
                button.dataset.id;


            if (action === "edit") {
                const transaction =
                    transactions.find(
                        (item) =>
                            item.id ===
                            transactionId
                    );

                if (transaction) {
                    openTransactionModal(
                        transaction
                    );
                }
            }


            if (action === "delete") {
                openDeleteModal(
                    transactionId
                );
            }
        }
    );
}


/* =========================
   ADD BUTTONS
========================= */

[
    addTransactionBtn,
    quickAddBtn,
    emptyAddBtn,
    mobileAddBtn
]
    .filter(Boolean)
    .forEach((button) => {
        button.addEventListener(
            "click",
            () =>
                openTransactionModal()
        );
    });


/* =========================
   MODAL BUTTONS
========================= */

if (cancelTransactionBtn) {
    cancelTransactionBtn.addEventListener(
        "click",
        closeTransactionModalWindow
    );
}


if (closeTransactionModal) {
    closeTransactionModal.addEventListener(
        "click",
        closeTransactionModalWindow
    );
}


if (transactionModal) {
    transactionModal.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                transactionModal
            ) {
                closeTransactionModalWindow();
            }
        }
    );
}


if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener(
        "click",
        closeDeleteModal
    );
}


if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener(
        "click",
        deleteTransaction
    );
}


if (deleteModal) {
    deleteModal.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                deleteModal
            ) {
                closeDeleteModal();
            }
        }
    );
}


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    (event) => {
        if (event.key !== "Escape") {
            return;
        }

        if (
            transactionModal &&
            transactionModal.classList.contains(
                "show"
            )
        ) {
            closeTransactionModalWindow();
        }

        if (
            deleteModal &&
            deleteModal.classList.contains(
                "show"
            )
        ) {
            closeDeleteModal();
        }
    }
);





/* =========================
   TOAST
========================= */

function showToast(
    message,
    type = "success"
) {
    const toastContainer =
        document.getElementById(
            "toastContainer"
        );

    if (!toastContainer) {
        return;
    }

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        `toast ${type}`;

    toast.textContent =
        message;

    toastContainer.appendChild(
        toast
    );

    setTimeout(() => {
        toast.classList.add(
            "hide"
        );

        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2500);
}


/* =========================
   INITIALIZE
========================= */

loadTransactions();

updateCategoryFilter();

renderTransactions();

updateDashboard();

console.log(
    "SpendWise initialized successfully."
);


/* ====================
   SPENDING ANALYTICS
==================== */

const analyticsIncome =
    document.getElementById(
        "analyticsIncome"
    );

const analyticsExpenses =
    document.getElementById(
        "analyticsExpenses"
    );

const analyticsAverage =
    document.getElementById(
        "analyticsAverage"
    );

const analyticsLargest =
    document.getElementById(
        "analyticsLargest"
    );


const incomeExpenseChartCanvas =
    document.getElementById(
        "incomeExpenseChart"
    );

const incomeExpenseEmpty =
    document.getElementById(
        "incomeExpenseEmpty"
    );

const monthlySummary =
    document.getElementById(
        "monthlySummary"
    );


let incomeExpenseChart = null;


/* =========================
   CURRENT MONTH TRANSACTIONS
========================= */

function getCurrentMonthTransactions() {
    const now = new Date();

    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth();

    return transactions.filter(
        (transaction) => {
            if (!transaction.date) {
                return false;
            }

            const transactionDate =
                new Date(
                    `${transaction.date}T00:00:00`
                );

            if (
                Number.isNaN(
                    transactionDate.getTime()
                )
            ) {
                return false;
            }

            return (
                transactionDate.getFullYear() ===
                    currentYear &&
                transactionDate.getMonth() ===
                    currentMonth
            );
        }
    );
}

/* =========================
   MONTHLY CATEGORY SUMMARY
========================= */

function updateMonthlySummary(
    expenseTransactions
) {
    if (!monthlySummary) {
        return;
    }

    const categoryTotals = {};

    expenseTransactions.forEach(
        (transaction) => {
            const category =
                (
                    transaction.category ||
                    "Other"
                ).trim();

            const amount =
                Number(
                    transaction.amount || 0
                );

            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }

            categoryTotals[category] +=
                amount;
        }
    );


    const summaryRows =
        monthlySummary.querySelectorAll(
            ".summary-row"
        );


    summaryRows.forEach((row) => {
        const categoryLabel =
            row
                .querySelector("span")
                ?.textContent
                .trim();

        const amountElement =
            row.querySelector("strong");

        if (
            !categoryLabel ||
            !amountElement
        ) {
            return;
        }


        let amount = 0;


        if (
            categoryLabel.toLowerCase() ===
            "other"
        ) {
            amount =
                Object.entries(
                    categoryTotals
                )
                    .filter(
                        ([category]) => {
                            const normalized =
                                category
                                    .toLowerCase()
                                    .trim();

                            return (
                                normalized !==
                                    "food" &&
                                normalized !==
                                    "transport" &&
                                normalized !==
                                    "shopping"
                            );
                        }
                    )
                    .reduce(
                        (
                            total,
                            [, categoryAmount]
                        ) =>
                            total +
                            categoryAmount,
                        0
                    );
        } else {
            const matchingCategory =
                Object.keys(
                    categoryTotals
                ).find(
                    (category) =>
                        category
                            .toLowerCase()
                            .trim() ===
                        categoryLabel
                            .toLowerCase()
                            .trim()
                );

            if (matchingCategory) {
                amount =
                    categoryTotals[
                        matchingCategory
                    ];
            }
        }


        amountElement.textContent =
            formatCurrency(amount);
    });
}


/* =========================
   UPDATE ANALYTICS
========================= */

function updateAnalytics() {
    const monthlyTransactions =
        getCurrentMonthTransactions();

    const incomeTransactions =
        monthlyTransactions.filter(
            (transaction) =>
                transaction.type ===
                "income"
        );

    const expenseTransactions =
        monthlyTransactions.filter(
            (transaction) =>
                transaction.type ===
                "expense"
        );


    const totalIncome =
        incomeTransactions.reduce(
            (total, transaction) =>
                total +
                Number(
                    transaction.amount || 0
                ),
            0
        );


    const totalExpenses =
        expenseTransactions.reduce(
            (total, transaction) =>
                total +
                Number(
                    transaction.amount || 0
                ),
            0
        );


    const averageExpense =
        expenseTransactions.length > 0
            ? totalExpenses /
              expenseTransactions.length
            : 0;


    const largestExpense =
        expenseTransactions.length > 0
            ? Math.max(
                  ...expenseTransactions.map(
                      (transaction) =>
                          Number(
                              transaction.amount ||
                                  0
                          )
                  )
              )
            : 0;
    updateMonthlySummary(
    expenseTransactions
    );


    if (analyticsIncome) {
        analyticsIncome.textContent =
            formatCurrency(
                totalIncome
            );
    }

    if (analyticsExpenses) {
        analyticsExpenses.textContent =
            formatCurrency(
                totalExpenses
            );
    }

    if (analyticsAverage) {
        analyticsAverage.textContent =
            formatCurrency(
                averageExpense
            );
    }

    if (analyticsLargest) {
        analyticsLargest.textContent =
            formatCurrency(
                largestExpense
            );
    }


    drawIncomeExpenseChart(
        totalIncome,
        totalExpenses
    );
}


/* =========================
   INCOME VS EXPENSE CHART
========================= */

function drawIncomeExpenseChart(
    income,
    expenses
) {
    if (!incomeExpenseChartCanvas) {
        return;
    }


    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();

        incomeExpenseChart = null;
    }


    const hasData =
        income > 0 ||
        expenses > 0;


    if (incomeExpenseEmpty) {
        incomeExpenseEmpty.style.display =
            hasData
                ? "none"
                : "flex";
    }


    incomeExpenseChartCanvas.style.display =
        hasData
            ? "block"
            : "none";


    if (!hasData) {
        return;
    }


    if (typeof Chart === "undefined") {
        console.warn(
            "Chart.js is not loaded."
        );

        return;
    }


    incomeExpenseChart =
        new Chart(
            incomeExpenseChartCanvas,
            {
                type: "bar",

                data: {
                    labels: [
                        "Income",
                        "Expenses"
                    ],

                    datasets: [
                        {
                            label: "Amount",

                            data: [
                                income,
                                expenses
                            ],

                            borderWidth: 0,

                            borderRadius: 8
                        }
                    ]
                },

                options: {
                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {
                        legend: {
                            display: false
                        }
                    },

                    scales: {
                        y: {
                            beginAtZero:
                                true,

                            ticks: {
                                callback:
                                    function (
                                        value
                                    ) {
                                        return (
                                            "₹" +
                                            Number(
                                                value
                                            ).toLocaleString(
                                                "en-IN"
                                            )
                                        );
                                    }
                            }
                        }
                    }
                }
            }
        );
}