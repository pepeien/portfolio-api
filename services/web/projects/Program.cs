using Projects.Services;
using Projects.Types.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.Configure<ApiKeysDatabaseSettings>(builder.Configuration.GetSection("ApiKeysDatabase"));

builder.Services.AddSingleton<ApiKeysService>();

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseAuthorization();

app.MapControllers();

app.Run();