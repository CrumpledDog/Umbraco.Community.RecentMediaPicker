using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Routing;

namespace Umbraco.Community.RecentMediaPicker.Controllers.RecentMedia
{
    [ApiController]
    [BackOfficeRoute("recentmediapicker/api/v{version:apiVersion}")]
    [Authorize(Policy = AuthorizationPolicies.SectionAccessMedia)]
    [MapToApi(Constants.ApiName)]
    public class RecentMediaControllerBase : ControllerBase
    {
    }
}
