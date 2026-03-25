using Microsoft.AspNetCore.Mvc;

namespace Capstone.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
<<<<<<< HEAD
    {
=======
    {   
>>>>>>> 6db2b41b996ad8cd4c49376274c55b909d678f68
        private static List<Product> products = new List<Product>
        {
            new Product { Id = 1, Name = "Mouse", Category = "Electronics", Qty = 50 },
            new Product { Id = 2, Name = "Chair", Category = "Furniture", Qty = 5 },
<<<<<<< HEAD
            new Product { Id = 3, Name = "Shirt", Category = "Apparel", Qty = 0 },
=======
            new Product { Id = 3, Name = "Shirt", Category = "Apparel", Qty = 0 }
>>>>>>> 6db2b41b996ad8cd4c49376274c55b909d678f68
        };

        [HttpGet]
        public IActionResult Get() => new JsonResult(products);

        [HttpPost]
        public IActionResult Add([FromBody] Product p)
        {
            if (p == null || string.IsNullOrEmpty(p.Name) || string.IsNullOrEmpty(p.Category))
                return BadRequest(new { error = "Invalid product data" });

            p.Id = products.Count > 0 ? products.Max(x => x.Id) + 1 : 1;
            products.Add(p);

            return new JsonResult(products);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var item = products.FirstOrDefault(x => x.Id == id);
            if (item == null) return NotFound(new { error = "Product not found" });

            products.Remove(item);
            return new JsonResult(products);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Product updated)
        {
            var item = products.FirstOrDefault(x => x.Id == id);
            if (item == null) return NotFound(new { error = "Product not found" });

            if (!string.IsNullOrEmpty(updated.Name)) item.Name = updated.Name;
            if (!string.IsNullOrEmpty(updated.Category)) item.Category = updated.Category;
            item.Qty = updated.Qty;

            return new JsonResult(products);
        }
    }

    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int Qty { get; set; }
    }
}