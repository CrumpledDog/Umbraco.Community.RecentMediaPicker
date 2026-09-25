using System;

namespace Umbraco.Community.RecentMediaPicker.Controllers.RecentMedia
{
    public class RecentMediaItemResponseModel
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Icon { get; set; }

        public DateTime CreateDate { get; set; }

        public DateTime UpdateDate { get; set; }

        public string? UpdatedByName { get; set; }
    }
}
