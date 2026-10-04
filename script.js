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

let transactions = [];
let editingTransactionId = null;
let transactionToDeleteId = null;

let currentPage = 1;
const transactionsPerPage = 8;

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

        const typeRadio = document.querySelector(
            `input[name="transactionType"][value="${transaction.type}"]`
        );

        if (typeRadio) {
            typeRadio.checked = true;
        }

        document.getElementById("transactionModalTitle").textContent =
            "Edit Transaction";

        document.getElementById("modalEyebrow").textContent =
            "EDIT TRANSACTION";
    } else {
        editingTransactionId = null;

        transactionIdInput.value = "";

        dateInput.value = new Date()
            .toISOString()
            .split("T")[0];

        document.querySelector(
            'input[name="transactionType"][value="income"]'
        ).checked = true;

        document.getElementById("transactionModalTitle").textContent =
            "Add Transaction";

        document.getElementById("modalEyebrow").textContent =
            "TRANSACTION";
    }

    transactionModal.classList.add("show");
    transactionModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    setTimeout(() => {
        amountInput.focus();
    }, 100);
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

function getSelectedTransactionType() {
    const selectedType = document.querySelector(
        'input[name="transactionType"]:checked'
    );

    return selectedType ? selectedType.value : "income";
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

    if (!amountInput.value || Number.isNaN(amount) || amount <= 0) {
        amountError.textContent = "Enter an amount greater than 0.";
        amountInput.classList.add("input-error");
        isValid = false;
    }

    if (!category) {
        categoryError.textContent = "Please select a category.";
        categoryInput.classList.add("input-error");
        isValid = false;
    }

    if (!date) {
        dateError.textContent = "Please select a date.";
        dateInput.classList.add("input-error");
        isValid = false;
    }

    if (!description) {
        descriptionError.textContent = "Please enter a description.";
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

function generateTransactionId() {
    if (window.crypto && crypto.randomUUID) {
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

    const date = new Date(`${dateString}T00:00:00`);

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

function getFilteredTransactions() {
    const selectedType = typeFilter.value;
    const selectedCategory = categoryFilter.value;
    const selectedDate = dateFilter.value;
    const searchTerm = searchInput.value
        .trim()
        .toLowerCase();

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
                const searchableText = `
                    ${transaction.description}
                    ${transaction.category}
                    ${transaction.notes || ""}
                `.toLowerCase();

                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        })
        .sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
}

function renderTransactions() {
    const filteredTransactions = getFilteredTransactions();

    const totalPages = Math.max(
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
        (currentPage - 1) * transactionsPerPage;

    const endIndex =
        startIndex + transactionsPerPage;

    const pageTransactions =
        filteredTransactions.slice(
            startIndex,
            endIndex
        );

    transactionTableBody.innerHTML = "";

    if (pageTransactions.length === 0) {
        transactionTableBody.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-state-icon">₹</div>
                        <h3>${
                            transactions.length === 0
                                ? "Your wallet is quiet"
                                : "No transactions found"
                        }</h3>
                        <p>${
                            transactions.length === 0
                                ? "Start by adding your first income or expense transaction."
                                : "Try changing your filters or search term."
                        }</p>
                        ${
                            transactions.length === 0
                                ? `
                                    <button
                                        class="primary-btn small-btn"
                                        id="emptyAddBtn"
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

        const newEmptyAddBtn =
            document.getElementById("emptyAddBtn");

        if (newEmptyAddBtn) {
            newEmptyAddBtn.addEventListener(
                "click",
                () => openTransactionModal()
            );
        }
    } else {
        pageTransactions.forEach((transaction) => {
            const row = document.createElement("tr");

            const typeClass =
                transaction.type === "income"
                    ? "income"
                    : "expense";

            const amountPrefix =
                transaction.type === "income"
                    ? "+"
                    : "-";

            row.innerHTML = `
                <td>${formatDate(transaction.date)}</td>

                <td>
                    <div class="transaction-description">
                        <strong>
                            ${escapeHTML(transaction.description)}
                        </strong>
                        ${
                            transaction.notes
                                ? `
                                    <small>
                                        ${escapeHTML(
                                            transaction.notes
                                        )}
                                    </small>
                                `
                                : ""
                        }
                    </div>
                </td>

                <td>
                    <span class="category-badge">
                        ${escapeHTML(transaction.category)}
                    </span>
                </td>

                <td>
                    <span class="transaction-type ${typeClass}">
                        ${
                            transaction.type === "income"
                                ? "Income"
                                : "Expense"
                        }
                    </span>
                </td>

                <td>
                    <strong class="${typeClass}-amount">
                        ${amountPrefix}${formatCurrency(
                            transaction.amount
                        )}
                    </strong>
                </td>

                <td>
                    <div class="table-actions">
                        <button
                            type="button"
                            class="table-action-btn edit-btn"
                            data-action="edit"
                            data-id="${transaction.id}"
                            title="Edit transaction"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="table-action-btn delete-btn"
                            data-action="delete"
                            data-id="${transaction.id}"
                            title="Delete transaction"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            `;

            transactionTableBody.appendChild(row);
        });
    }

    transactionResultCount.textContent =
        `Showing ${filteredTransactions.length} transaction${
            filteredTransactions.length === 1
                ? ""
                : "s"
        }`;

    pageInfo.textContent =
        `Page ${currentPage} of ${totalPages}`;

    previousPageBtn.disabled =
        currentPage === 1;

    nextPageBtn.disabled =
        currentPage >= totalPages;
}

function updateDashboard() {
    const income = transactions
        .filter((transaction) => transaction.type === "income")
        .reduce(
            (total, transaction) =>
                total + transaction.amount,
            0
        );

    const expenses = transactions
        .filter((transaction) => transaction.type === "expense")
        .reduce(
            (total, transaction) =>
                total + transaction.amount,
            0
        );

    const balance = income - expenses;

    totalIncome.textContent =
        formatCurrency(income);

    totalExpenses.textContent =
        formatCurrency(expenses);

    currentBalance.textContent =
        formatCurrency(balance);

    transactionCount.textContent =
        transactions.length;

    savedTransactionCount.textContent =
        transactions.length;

    if (transactions.length === 0) {
        incomeChange.textContent =
            "No transactions yet";

        expenseChange.textContent =
            "No transactions yet";

        balanceStatus.textContent =
            "Add transactions to begin";

        transactionStatus.textContent =
            "No activity recorded";

        incomeChange.className =
            "summary-change neutral";

        expenseChange.className =
            "summary-change neutral";

        balanceStatus.className =
            "summary-change neutral";

        transactionStatus.className =
            "summary-change neutral";

        return;
    }

    incomeChange.textContent =
        `${transactions.filter(
            (transaction) =>
                transaction.type === "income"
        ).length} income transaction${
            transactions.filter(
                (transaction) =>
                    transaction.type === "income"
            ).length === 1
                ? ""
                : "s"
        }`;

    expenseChange.textContent =
        `${transactions.filter(
            (transaction) =>
                transaction.type === "expense"
        ).length} expense transaction${
            transactions.filter(
                (transaction) =>
                    transaction.type === "expense"
            ).length === 1
                ? ""
                : "s"
        }`;

    balanceStatus.textContent =
        balance >= 0
            ? "You are currently in positive balance"
            : "Expenses are higher than income";

    transactionStatus.textContent =
        `${transactions.length} transaction${
            transactions.length === 1
                ? ""
                : "s"
        } recorded`;

    balanceStatus.className =
        balance >= 0
            ? "summary-change positive"
            : "summary-change negative";

    transactionStatus.className =
        "summary-change neutral";
}

function saveNewTransaction() {
    const transaction =
        createTransactionObject();

    transactions.unshift(transaction);

    showToast(
        "Transaction added successfully."
    );
}

function updateExistingTransaction() {
    const index = transactions.findIndex(
        (transaction) =>
            transaction.id === editingTransactionId
    );

    if (index === -1) {
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

    showToast(
        "Transaction updated successfully."
    );
}

function openDeleteModal(transactionId) {
    if (!deleteModal) {
        return;
    }

    transactionToDeleteId =
        transactionId;

    deleteModal.classList.add("show");
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

    deleteModal.classList.remove("show");
    deleteModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

    transactionToDeleteId = null;
}

function deleteTransaction() {
    if (!transactionToDeleteId) {
        return;
    }

    transactions =
        transactions.filter(
            (transaction) =>
                transaction.id !==
                transactionToDeleteId
        );

    currentPage = 1;

    closeDeleteModal();
    renderTransactions();
    updateDashboard();

    showToast(
        "Transaction deleted successfully."
    );
}

function showToast(message) {
    const toastContainer =
        document.getElementById(
            "toastContainer"
        );

    if (!toastContainer) {
        return;
    }

    const toast =
        document.createElement("div");

    toast.className = "toast";
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("hide");

        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2500);
}

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
            saveNewTransaction();
        }

        closeTransactionModalWindow();

        renderTransactions();
        updateDashboard();
    }
);

[
    addTransactionBtn,
    quickAddBtn,
    emptyAddBtn,
    mobileAddBtn
].forEach((button) => {
    if (button) {
        button.addEventListener(
            "click",
            () => openTransactionModal()
        );
    }
});

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

[typeFilter, categoryFilter, dateFilter]
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
            typeFilter.value = "all";
            categoryFilter.value = "all";
            dateFilter.value = "";
            searchInput.value = "";

            currentPage = 1;

            renderTransactions();
        }
    );
}

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

document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Escape"
        ) {
            if (
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
    }
);

renderTransactions();
updateDashboard();

console.log(
    "SpendWise CRUD initialized."
);