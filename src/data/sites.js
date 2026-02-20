export default [
	{
		id: 'portal',
    name: 'Tenant Complaints Portal',
    url: 'https://complaints.tenantact.org/',
		types: [
      {
        id: 'submission',
        name: 'Submissions',
      },
      {
        id: 'page_view',
        name: 'Page Views',
      },
		],
    paths: [
      {
        id: '/repairs',
        name: 'Get Help with Repairs',
      },
      {
        id: '/report',
        name: 'Report Your Landlord',
      },
    ],
	},
]