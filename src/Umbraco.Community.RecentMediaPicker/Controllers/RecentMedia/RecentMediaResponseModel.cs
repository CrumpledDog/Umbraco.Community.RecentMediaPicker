using System.Collections.Generic;

namespace Umbraco.Community.RecentMediaPicker.Controllers.RecentMedia
{
    public class RecentMediaResponseModel
    {
        public IEnumerable<RecentMediaItemResponseModel> Items { get; set; } = new List<RecentMediaItemResponseModel>();

        /// <summary>
        /// True when the scan hit its safety cap before finding <c>take</c> authorized items, meaning
        /// more (possibly newer, for a "mine" query) items may exist but weren't scanned.
        /// </summary>
        public bool IsPartial { get; set; }
    }
}
