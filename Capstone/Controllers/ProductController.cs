using Microsoft.AspNetCore.Mvc;

namespace Capstone.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private static List<Product> products = new()
        {
            new Product { Id = 1, Name = "Mouse", Category = "Electronics", Qty = 50 },
            new Product { Id = 2, Name = "Chair", Category = "Furniture", Qty = 5 },
            new Product { Id = 3, Name = "Shirt", Category = "Apparel", Qty = 0 },
        };

        [HttpGet]
        public IActionResult Get() => new JsonResult(products);

        [HttpPost]
        public IActionResult Add([FromBody] Product p, [FromHeader(Name="Role")] string role)
        {
            if (role != "admin") return Unauthorized(new { error = "Not authorized" });
            if (p == null || string.IsNullOrEmpty(p.Name) || string.IsNullOrEmpty(p.Category))
                return BadRequest(new { error = "Invalid product data" });

            p.Id = products.Any() ? products.Max(x => x.Id) + 1 : 1;
            products.Add(p);
            return new JsonResult(products);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id, [FromHeader(Name="Role")] string role)
        {
            if (role != "admin") return Unauthorized(new { error = "Not authorized" });

            var item = products.FirstOrDefault(x => x.Id == id);
            if (item == null) return NotFound(new { error = "Product not found" });

            products.Remove(item);
            return new JsonResult(products);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Product updated, [FromHeader(Name="Role")] string role)
        {
            if (role != "admin") return Unauthorized(new { error = "Not authorized" });

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