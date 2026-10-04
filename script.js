const pageSections = document.querySelectorAll(".page-section");
const navLinks = document.querySelectorAll(".nav-link");
const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

const transactionModal = document.getElementById("transactionModal");
const transactionForm = document.getElementById("transactionForm");

const addTransactionBtn = document.getElementById("addTransactionBtn");
const quickAddBtn = document.getElementById("quickAddBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");
const mobileAddBtn = document.getElementById("mobileAddBtn");

const cancelTransactionBtn = document.getElementById("cancelTransactionBtn");
const closeTransactionModal = document.getElementById("closeTransactionModal");

const transactionIdInput = document.getElementById("transactionId");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");
const notesInput = document.getElementById("notes");

const amountError = document.getElementById("amountError");
const categoryError = document.getElementById("categoryError");
const dateError = document.getElementById("dateError");
const descriptionError = document.getElementById("descriptionError");
const formMessage = document.getElementById("formMessage");

const transactionTableBody = document.getElementById("transactionTableBody");
const transactionResultCount = document.getElementById("transactionResultCount");

const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");
const dateFilter = document.getElementById("dateFilter");
const searchInput = document.getElementById("searchInput");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

const previousPageBtn = document.getElementById("previousPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");

const deleteModal = document.getElementById("deleteModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const totalIncome = document.getElementById("totalIncome");
const totalExpenses = document.getElementById("totalExpenses");
const currentBalance = document.getElementById("currentBalance");
const transactionCount = document.getElementById("transactionCount");

const incomeChange = document.getElementById("incomeChange");
const expenseChange = document.getElementById("expenseChange");
const balanceStatus = document.getElementById("balanceStatus");
const transactionStatus = document.getElementById("transactionStatus");

const savedTransactionCount = document.getElementById("savedTransactionCount");

const STORAGE_KEY = "spendwise_transactions";

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
            link.getAttribute("href") === `#${sectionId}`
        );
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        showSection(link.dataset.section);
    });
});

mobileNavLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();

        const sectionId = link
            .getAttribute("href")
            .replace("#", "");

        showSection(sectionId);
    });
});


/* =========================
   LOCAL STORAGE
========================= */

function loadTransactions() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) {
            transactions = [];
            return;
        }

        const parsedData = JSON.parse(savedData);

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

function openTransactionModal(transaction = null) {
    if (!transactionModal) {
        return;
    }

    transactionForm.reset();
    clearValidationErrors();

    if (transaction) {
        editingTransactionId = transaction.id;

        transactionIdInput.value = transaction.id;
        amountInput.value = transaction.amount;
        categoryInput.value = transaction.category;
        dateInput.value = transaction.date;
        descriptionInput.value = transaction.description;
        notesInput.value = transaction.notes || "";

        const selectedType = document.querySelector(
            `input[name="transactionType"][value="${transaction.type}"]`
        );

        if (selectedType) {
            selectedType.checked = true;
        }

        setModalTitle("Edit Transaction");
    } else {
        editingTransactionId = null;

        transactionIdInput.value = "";

        dateInput.value = new Date()
            .toISOString()
            .split("T")[0];

        const incomeRadio = document.querySelector(
            'input[name="transactionType"][value="income"]'
        );

        if (incomeRadio) {
            incomeRadio.checked = true;
        }

        setModalTitle("Add Transaction");
    }

    transactionModal.classList.add("show");
    transactionModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    setTimeout(() => {
        amountInput.focus();
    }, 100);
}

function setModalTitle(title) {
    const titleElement =
        document.getElementById("transactionModalTitle");

    if (titleElement) {
        titleElement.textContent = title;
    }

    const eyebrow =
        document.getElementById("modalEyebrow");

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

    transactionModal.classList.remove("show");
    transactionModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    transactionForm.reset();
    transactionIdInput.value = "";

    editingTransactionId = null;

    clearValidationErrors();
}

function openDeleteModal(transactionId) {
    if (!deleteModal) {
        return;
    }

    transactionToDeleteId = transactionId;

    deleteModal.classList.add("show");
    deleteModal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");
}

function closeDeleteModal() {
    if (!deleteModal) {
        return;
    }

    deleteModal.classList.remove("show");
    deleteModal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    transactionToDeleteId = null;
}


/* =========================
   FORM VALIDATION
========================= */

function getSelectedTransactionType() {
    const selectedType = document.querySelector(
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

    amountInput.classList.remove("input-error");
    categoryInput.classList.remove("input-error");
    dateInput.classList.remove("input-error");
    descriptionInput.classList.remove("input-error");

    formMessage.textContent = "";
    formMessage.className = "form-message";
}

function validateTransactionForm() {
    clearValidationErrors();

    let isValid = true;

    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;
    const description = descriptionInput.value.trim();

    if (
        !amountInput.value ||
        Number.isNaN(amount) ||
        amount <= 0
    ) {
        amountError.textContent =
            "Enter an amount greater than 0.";

        amountInput.classList.add("input-error");

        isValid = false;
    }

    if (!category) {
        categoryError.textContent =
            "Please select a category.";

        categoryInput.classList.add("input-error");

        isValid = false;
    }

    if (!date) {
        dateError.textContent =
            "Please select a date.";

        dateInput.classList.add("input-error");

        isValid = false;
    }

    if (!description) {
        descriptionError.textContent =
            "Please enter a description.";

        descriptionInput.classList.add("input-error");

        isValid = false;
    }

    if (!isValid) {
        formMessage.textContent =
            "Please correct the highlighted fields.";

        formMessage.classList.add("error");
    }

    return isValid;
}


/* =========================
   TRANSACTION OBJECT
========================= */

function generateTransactionId() {
    if (
        window.crypto &&
        typeof crypto.randomUUID === "function"
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
        type: getSelectedTransactionType(),
        amount: Number(amountInput.value),
        category: categoryInput.value,
        date: dateInput.value,
        description: descriptionInput.value.trim(),
        notes: notesInput.value.trim(),
        createdAt: new Date().toISOString()
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
    }
);

function addNewTransaction() {
    const transaction =
        createTransactionObject();

    transactions.unshift(transaction);

    saveTransactions();

    showToast(
        "Transaction added successfully.",
        "success"
    );
}

function updateExistingTransaction() {
    const index = transactions.findIndex(
        (transaction) =>
            transaction.id === editingTransactionId
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
        type: getSelectedTransactionType(),
        amount: Number(amountInput.value),
        category: categoryInput.value,
        date: dateInput.value,
        description: descriptionInput.value.trim(),
        notes: notesInput.value.trim()
    };

    saveTransactions();

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

    transactions = transactions.filter(
        (transaction) =>
            transaction.id !== transactionToDeleteId
    );

    if (transactions.length === previousLength) {
        closeDeleteModal();

        showToast(
            "Transaction could not be found.",
            "error"
        );

        return;
    }

    saveTransactions();

    currentPage = 1;

    closeDeleteModal();

    renderTransactions();
    updateDashboard();

    showToast(
        "Transaction deleted successfully.",
        "success"
    );
}


/* =========================
   FORMATTING
========================= */

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) {
        return "-";
    }

    const date =
        new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
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
                transaction.type !== selectedType
            ) {
                return false;
            }

            if (
                selectedCategory !== "all" &&
                transaction.category !== selectedCategory
            ) {
                return false;
            }

            if (
                selectedDate &&
                transaction.date !== selectedDate
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
                    description.includes(searchTerm) ||
                    category.includes(searchTerm) ||
                    notes.includes(searchTerm);

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
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
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

    categories.forEach((category) => {
        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);
    });

    if (
        categories.includes(currentValue)
    ) {
        categoryFilter.value =
            currentValue;
    } else {
        categoryFilter.value = "all";
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

    transactionTableBody.innerHTML = "";

    if (pageTransactions.length === 0) {
        const hasFilters =
            (
                typeFilter &&
                typeFilter.value !== "all"
            ) ||
            (
                categoryFilter &&
                categoryFilter.value !== "all"
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
                () => openTransactionModal()
            );
        }
    } else {
        pageTransactions.forEach(
            (transaction) => {
                const row =
                    document.createElement("tr");

                const typeClass =
                    transaction.type === "income"
                        ? "income"
                        : "expense";

                const amountPrefix =
                    transaction.type === "income"
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

                transactionTableBody.appendChild(row);
            }
        );
    }

    if (transactionResultCount) {
        transactionResultCount.textContent =
            `Showing ${
                filteredTransactions.length
            } transaction${
                filteredTransactions.length === 1
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
                    transaction.type === "income"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(transaction.amount || 0),
                0
            );

    const expenses =
        transactions
            .filter(
                (transaction) =>
                    transaction.type === "expense"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(transaction.amount || 0),
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
                transaction.type === "income"
        ).length;

    const expenseCount =
        transactions.filter(
            (transaction) =>
                transaction.type === "expense"
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
                typeFilter.value = "all";
            }

            if (categoryFilter) {
                categoryFilter.value = "all";
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

            if (currentPage < totalPages) {
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
            () => openTransactionModal()
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
            transactionModal.classList.contains("show")
        ) {
            closeTransactionModalWindow();
        }

        if (
            deleteModal &&
            deleteModal.classList.contains("show")
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
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    toast.textContent =
        message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("hide");

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