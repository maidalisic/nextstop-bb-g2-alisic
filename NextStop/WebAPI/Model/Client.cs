namespace WebAPI.Model;

public partial class Client
{
    public int Id { get; set; }

    public string Clientname { get; set; } = null!;

    public string Passwordhash { get; set; } = null!;

    public string Role { get; set; } = null!;
}