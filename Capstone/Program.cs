var builder = WebApplication.CreateBuilder(args);

// Add controllers
builder.Services.AddControllers();

// Enable CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseStaticFiles(); // Serve wwwroot
app.UseCors();        // Enable CORS
app.MapControllers();

app.Run();