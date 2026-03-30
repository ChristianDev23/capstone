const API_URL = "http://localhost:5229/api/Product";

let products = [];
const table = document.getElementById("productTable");
const role = localStorage.getItem("role");

// 🚫 If not logged in → go back to login
if (!role) {
    window.location.href = "index.html";
}

// 🔒 Hide Add button if not admin
if (role !== "admin") {
    const addBtn = document.getElementById("addBtn");
    if (addBtn) addBtn.style.display = "none";
}

// 🚪 LOGOUT
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("role");
    window.location.href = "index.html";
});

// --------------------- FETCH PRODUCTS ---------------------
async function fetchProducts() {
    try {
        const res = await fetch(API_URL);

        if (!res.ok) throw new Error("Failed to fetch");

        products = await res.json();
        render();

    } catch (err) {
        console.error("Fetch error:", err);
        alert("Error fetching products from server.");
    }
}

// --------------------- RENDER ---------------------
function render() {
    table.innerHTML = "";

    let available = 0, low = 0, out = 0;

    products.forEach(p => {
        if (p.qty === 0) out++;
        else if (p.qty < 10) low++;
        else available++;

        table.innerHTML += `
        <tr>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.qty}</td>
            <td class="actions">
                ${role === "admin" ? `
                    <button class="edit" onclick="editProduct(${p.id})">Edit</button>
                    <button class="delete" onclick="deleteProduct(${p.id})">Delete</button>
                ` : ``}
            </td>
        </tr>`;
    });

    document.getElementById("totalProducts").innerText = products.length;
    document.getElementById("available").innerText = available;
    document.getElementById("low").innerText = low;
    document.getElementById("out").innerText = out;
}

function openModal() {
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

function clearModalFields() {
    document.getElementById("name").value = "";
    document.getElementById("category").value = "";
    document.getElementById("qty").value = "";
}

async function saveProduct() {
    if (role !== "admin") return alert("Not authorized");

    const name = document.getElementById("name").value.trim();
    const category = document.getElementById("category").value.trim();
    const qty = parseInt(document.getElementById("qty").value);

    if (!name || !category || isNaN(qty) || qty < 0)
        return alert("Fill all fields correctly");

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Role": role
            },
            body: JSON.stringify({ name, category, qty })
        });

        if (!res.ok) return alert("Failed to save");

        products = await res.json();
        closeModal();
        clearModalFields();
        render();

    } catch (err) {
        console.error(err);
        alert("Error saving product");
    }
}

async function deleteProduct(id) {
    if (role !== "admin") return alert("Not authorized");
    if (!confirm("Delete product?")) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: { "Role": role }
        });

        if (!res.ok) return alert("Failed to delete");

        products = await res.json();
        render();

    } catch (err) {
        console.error(err);
        alert("Error deleting product");
    }
}

async function editProduct(id) {
    if (role !== "admin") return alert("Not authorized");

    const product = products.find(p => p.id === id);
    const qty = prompt("Enter new quantity", product.qty);

    if (qty === null) return;

    const newQty = parseInt(qty);
    if (isNaN(newQty) || newQty < 0)
        return alert("Invalid quantity");

    product.qty = newQty;

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Role": role
            },
            body: JSON.stringify(product)
        });

        if (!res.ok) return alert("Failed to update");

        products = await res.json();
        render();

    } catch (err) {
        console.error(err);
        alert("Error updating product");
    }
}

document.getElementById("search").addEventListener("keyup", function () {
    const val = this.value.toLowerCase();

    document.querySelectorAll("#productTable tr").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
    });
});

fetchProducts();