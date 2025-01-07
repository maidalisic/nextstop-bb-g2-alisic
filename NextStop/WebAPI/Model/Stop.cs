using System;
using System.Collections.Generic;

namespace WebAPI.Model;

public partial class Stop
{
    public int Id { get; set; }

    public string? Name { get; set; }

    public string? Shortcode { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }
}
