using Microsoft.AspNetCore.Mvc;

namespace Capstone.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private static List<User> users = new()
        {
            new User { Username = "admin", Password = "admin123", Role = "admin" },
            new User { Username = "santi", Password = "user123", Role = "user" }
        };

        [HttpPost("login")] // lowercase to match fetch
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = users.FirstOrDefault(u =>
                u.Username.Equals(request.Username, StringComparison.OrdinalIgnoreCase)
                && u.Password == request.Password
            );

            if (user == null)
                return Unauthorized(new { error = "Invalid username or password" });

            return Ok(new { role = user.Role });
        }
    }

    public class User
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}