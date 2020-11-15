const rallyData = {
    "title":"DemocraSEE Code Review",
    "start": "Saturday, November 11th 9:00 - 9:30pm",
    "img":"/images/Screenshot_2020-11-14.png",
    "videolink":"https://meet.google.com/zoa-txas-bbk",
    "city":"Oakland, CA",
    "moderators":[
        {"img":"https://democrasee.club/wp-content/uploads/bb-plugin/cache/Screen-Shot-2020-10-11-at-1.18.18-PM-circle.png", "name":"Eli"}
    ],
    "speakers":[
        {"img":"https://democrasee.club/wp-content/uploads/bb-plugin/cache/Screen-Shot-2020-10-11-at-1.18.29-PM-circle.png", "name":"Marcela"},
        {"img":"https://democrasee.club/wp-content/uploads/bb-plugin/cache/Screen-Shot-2020-10-11-at-1.18.06-PM-circle.png", "name":"Indy"},
        {"img":"https://democrasee.club/wp-content/uploads/bb-plugin/cache/Screen-Shot-2020-10-11-at-1.18.39-PM-circle.png", "name":"Polina"}
    ],
    "lineItems": [
        {
            "title":"Cities",
            "nest": ["Wordpress CMS"],
            "html": "<a target='_blank' href='https://github.com/eliataylor/democrasee-wp/blob/d1a7f4bcbbc7e6d838b09ff84e99d835224958ce/cli/city_sync.php'>City Importer</a> from SimpleMaps & US Census data</a>" ,
            "seconds": 60 * 1
        },
        {
            "title":"Taxonomy",
            "nest": ["Wordpress CMS"],
            "html": "<a target='_blank' href='https://github.com/eliataylor/democrasee-wp/blob/e5b9c0f1596820cfe0deb0e8e4b9733252dafbd3/cli/field_registry.php'>Vocabulary Importer</a>",
            "seconds": 60 * 1
        },
        {
            "title":"Other Content",
            "nest": ["Wordpress CMS"],
            "desc": "Manual migration",
            "seconds": 60 * 4
        },
        {
            "title":"Ready",
            "nest": ["Wordpress API"],
            // maybe change to https://wordpress.org/plugins/jwt-auth/
            "html": "<ul>" +
                "<li><a target='_blank' href='https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/'>JWT Authentication</a></li>" +
                "<li><a target='_blank' href='https://developer.wordpress.org/rest-api'>WP-JSON</a></li>" +
                "<li><a target='_blank' href='https://github.com/eliataylor/democrasee-wp/blob/57de80f9cc99a5fb5c1ac45fb43feff35206ee9f/cli/Democrasee_API.postman_collection.json'>Postman Collection</a></ul>",

            "seconds": 60  * 5
        },
        {
            "title":"RoadMap",
            "nest": ["Wordpress API"],
            "desc": "Customizing user role capabilities. Investigate MyCred integration",
            "seconds": 60 * 2
        },
        {
            "title":"Styling",
            "nest": ["ReactJS Web App"],
            "html": "<a target='_blank' href='https://material-ui.com/components/steppers/'>Material-UI Components</a> and CSS",
            "seconds": 60 * 2
        },{
            "title":"Interactivity",
            "nest": ["ReactJS Web App"],
            "html": "Redux, React-Router and other <a target='_blank' href='https://github.com/eliataylor/clock-agendas/blob/d192124a424b7b56d8923cae4052b3f52812733c/package.json#L5'>dependencies</a>",
            "seconds": 60 * 2
        },
        {
            "title":"Firebase",
            "nest": ["Web Server"],
            "desc": "`firebase deploy`, analytics, CDN and affordable pricing",
            "seconds": 60 * 2
        },
        {
            "title":"Google Cloud Platform",
            "nest": ["Web Server"],
            "desc": "Linux, Apache, mySQL, PHP",
            "seconds": 60 * 2
        }
    ]
}

export default rallyData;
