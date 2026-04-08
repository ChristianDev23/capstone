const API_URL = "http://localhost:5229/api/Product";
let products = [];
const role = localStorage.getItem("role");

if (!role) window.location.href = "index.html";

const dashboardPage = document.getElementById("dashboardPage");
const productsPage = document.getElementById("productsPage");
const addBtn = document.getElementById("addBtn");
const table = document.getElementById("productTable");
const searchInput = document.getElementById("search");

document.getElementById("navDashboard").addEventListener("click", () => {
    if(role !== "admin") return showNotification("Admin only","info");
    dashboardPage.style.display = "block";
    productsPage.style.display = "none";
});

document.getElementById("navProducts").addEventListener("click", () => {
    dashboardPage.style.display = "none";
    productsPage.style.display = "block";
});

if(role !== "admin" && addBtn) addBtn.style.display = "none";

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("role");
    window.location.href = "index.html";
});

function showNotification(msg,type="error",dur=3000){
    const n=document.getElementById("notification");
    n.innerText=msg;
    n.className=`notification show ${type}`;
    setTimeout(()=>n.classList.remove("show"),dur);
}

function openModal(){ 
    if(role!=="admin") return showNotification("Admin only","info");
    document.getElementById("modal").style.display="flex"; 
}
function closeModal(){ 
    document.getElementById("modal").style.display="none"; 
    document.getElementById("name").value="";
    document.getElementById("category").value="";
    document.getElementById("qty").value="";
}

async function fetchProducts(){
    try{
        const res = await fetch(API_URL);
        if(!res.ok) throw new Error("Failed to fetch products");
        products = await res.json();

        products = products.map(p => {
            if(!p.lastUpdated) p.lastUpdated = new Date().toISOString();
            return p;
        });

        renderProductTable();
        if(role==="admin"){ renderDashboardCards(); renderCategoryCharts(); }
    }catch(err){ showNotification(err.message,"error"); }
}

function renderProductTable(){
    table.innerHTML="";
    products.forEach(p=>{
        const lastUpdated = p.lastUpdated ? formatDateTime(p.lastUpdated) : "-";
        table.innerHTML+=`
        <tr>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.qty}</td>
            <td>${lastUpdated}</td>
            <td class="actions">
                ${role==="admin"?`<button class="edit" onclick="editProduct(${p.id})">Edit</button>
                <button class="delete" onclick="deleteProduct(${p.id})">Delete</button>`:""}
            </td>
        </tr>`;
    });
}

function formatDateTime(dt){
    const d = new Date(dt);
    const options = { month:"long", day:"numeric", year:"numeric" };
    const date = d.toLocaleDateString(undefined, options);
    const time = d.toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"});
    return `${date}: ${time}`;
}

function renderDashboardCards(){
    const counts={Apparel:0,Furniture:0,Electronics:0};
    products.forEach(p=>counts[p.category]!==undefined?counts[p.category]++:0);
    document.getElementById("cardApparel").querySelector("h2").innerText=counts.Apparel;
    document.getElementById("cardFurniture").querySelector("h2").innerText=counts.Furniture;
    document.getElementById("cardElectronics").querySelector("h2").innerText=counts.Electronics;
    document.getElementById("cardTotal").querySelector("h2").innerText=products.length;
}

function renderCategoryCharts(){
    const chartContainer = document.querySelector(".category-charts");
    chartContainer.innerHTML="";
    ["Apparel","Furniture","Electronics"].forEach(cat=>{
        const catProducts = products.filter(p=>p.category===cat);
        const available = catProducts.filter(p=>p.qty>=10).length;
        const low = catProducts.filter(p=>p.qty>0 && p.qty<10).length;
        const out = catProducts.filter(p=>p.qty===0).length;

        const canvasId=`chart-${cat.replace(/\s+/g,"")}`;
        const div=document.createElement("div");
        div.classList.add("category-chart");
        div.innerHTML=`<canvas id="${canvasId}"></canvas><span>${cat}</span>`;
        chartContainer.appendChild(div);

        new Chart(document.getElementById(canvasId),{
            type:"doughnut",
            data:{labels:["Available","Low Stock","Out of Stock"],datasets:[{data:[available,low,out],backgroundColor:["#28a745","#ffc107","#dc3545"]}]},
            options:{cutout:"60%",plugins:{legend:{display:false}},responsive:true,maintainAspectRatio:false}
        });
    });
}

async function saveProduct(){
    if(role!=="admin") return showNotification("Admin only","info");
    const name=document.getElementById("name").value.trim();
    const category=document.getElementById("category").value;
    const qty=parseInt(document.getElementById("qty").value);
    if(!name||!category||isNaN(qty)||qty<0) return showNotification("Fill all fields correctly","error");

    try{
        const res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json","Role":role},body:JSON.stringify({name,category,qty})});
        if(!res.ok) throw new Error("Failed to save product");
        products=await res.json();
        closeModal(); renderProductTable(); renderDashboardCards(); renderCategoryCharts();
        showNotification("Product saved","success");
    }catch(err){ showNotification(err.message,"error"); }
}

function editProduct(id){
    const p=products.find(x=>x.id===id);
    if(!p) return showNotification("Product not found","error");
    const qty=prompt("Enter new quantity",p.qty);
    if(qty===null) return;
    const newQty=parseInt(qty);
    if(isNaN(newQty)||newQty<0) return showNotification("Invalid quantity","error");
    p.qty=newQty; saveEditedProduct(p);
}

async function saveEditedProduct(product){
    try{
        const res=await fetch(`${API_URL}/${product.id}`,{method:"PUT",headers:{"Content-Type":"application/json","Role":role},body:JSON.stringify(product)});
        if(!res.ok) throw new Error("Update failed");
        products=await res.json(); renderProductTable(); renderDashboardCards(); renderCategoryCharts();
        showNotification("Product updated","success");
    }catch(err){ showNotification(err.message,"error"); }
}

async function deleteProduct(id){
    if(!confirm("Delete this product?")) return;
    try{
        const res=await fetch(`${API_URL}/${id}`,{method:"DELETE",headers:{Role:role}});
        if(!res.ok) throw new Error("Delete failed");
        products=await res.json(); renderProductTable(); renderDashboardCards(); renderCategoryCharts();
        showNotification("Product deleted","success");
    }catch(err){ showNotification(err.message,"error"); }
}

if(searchInput) searchInput.addEventListener("keyup",function(){
    const val=this.value.toLowerCase();
    document.querySelectorAll("#productTable tr").forEach(r=>r.style.display=r.innerText.toLowerCase().includes(val)?"":"none");
});

fetchProducts();