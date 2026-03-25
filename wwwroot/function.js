let products = [];
const table = document.getElementById("productTable");

// --------------------- FETCH PRODUCTS ---------------------
async function fetchProducts() {
    try {
        const res = await fetch("/api/Product"); // Works because HTML served via .NET
        if (!res.ok) throw new Error("Failed to fetch products");
        products = await res.json();
        render();
    } catch (err) {
        console.error("Error fetching products:", err);
        alert("Error fetching products from server. Make sure the backend is running.");
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
                <button class="edit" onclick="editProduct(${p.id})">Edit</button>
                <button class="delete" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
        </tr>`;
    });

    document.getElementById("totalProducts").innerText = products.length;
    document.getElementById("available").innerText = available;
    document.getElementById("low").innerText = low;
    document.getElementById("out").innerText = out;

    updateChart(available, low, out);
}

// --------------------- MODAL ---------------------
function openModal() { document.getElementById("modal").style.display = "flex"; }
function closeModal() { document.getElementById("modal").style.display = "none"; }
function clearModalFields() {
    document.getElementById("name").value = "";
    document.getElementById("category").value = "";
    document.getElementById("qty").value = "";
}

// --------------------- ADD PRODUCT ---------------------
async function saveProduct() {
    const name = document.getElementById("name").value.trim();
    const category = document.getElementById("category").value.trim();
    const qty = parseInt(document.getElementById("qty").value);

    if (!name || !category || isNaN(qty) || qty < 0) return alert("Fill all fields correctly");

    try {
        const res = await fetch("/api/Product", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, category, qty })
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            return alert(error.error || "Failed to save product");
        }

        products = await res.json();
        closeModal();
        clearModalFields();
        render();
    } catch (err) {
        console.error("Error saving product:", err);
        alert("Error saving product to server");
    }
}

// --------------------- DELETE ---------------------
async function deleteProduct(id) {
    if (!confirm("Delete product?")) return;

    try {
        const res = await fetch(`/api/Product/${id}`, { method: "DELETE" });
        if (!res.ok) return alert("Failed to delete product");

        products = await res.json();
        render();
    } catch (err) {
        console.error("Error deleting product:", err);
        alert("Error deleting product from server");
    }
}

// --------------------- EDIT ---------------------
async function editProduct(id) {
    const product = products.find(p => p.id === id);
    const qty = prompt("Enter new quantity", product.qty);
    if (qty === null) return;

    const newQty = parseInt(qty);
    if (isNaN(newQty) || newQty < 0) return alert("Invalid quantity");

    product.qty = newQty;

    try {
        const res = await fetch(`/api/Product/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product)
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            return alert(error.error || "Failed to update product");
        }

        products = await res.json();
        render();
    } catch (err) {
        console.error("Error updating product:", err);
        alert("Error updating product on server");
    }
}

// --------------------- SEARCH ---------------------
document.getElementById("search").addEventListener("keyup", function () {
    const val = this.value.toLowerCase();
    document.querySelectorAll("#productTable tr").forEach(r => {
        r.style.display = r.innerText.toLowerCase().includes(val) ? "" : "none";
    });
});

// --------------------- CHART ---------------------
function updateChart(a, l, o) {
    document.getElementById("circleAvailable").innerText = a;
    document.getElementById("circleLow").innerText = l;
    document.getElementById("circleOut").innerText = o;
}

// --------------------- INITIAL LOAD ---------------------
fetchProducts();