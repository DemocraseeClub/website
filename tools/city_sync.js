$filename = "uscities.csv";
$map = {
    'city': 0,
    'city_ascii': 1,
    'state_id': 2,
    'state_name': 3,
    'county_fips': 4,
    'county_name': 5,
    'lat': 6,
    'lng': 7,
    'population': 8,
    'density': 9,
    'source': 10,
    'military': 11,
    'incorporated': 12,
    'timezone': 13,
    'ranking': 14,
    'zips': 15,
    'id': 16,
};

/*
$filename = 'sub-est2019_all.csv';
$map = {
    'SUMLEV' : 0,
    'STATE' : 1,
    'COUNTY' : 2,
    'PLACE' : 3,
    'COUSUB' : 4,
    'CONCIT' : 5,
    'PRIMGEO_FLAG' : 6,
    'FUNCSTAT' : 7,
    'NAME' : 8,
    'STNAME' : 9,
    'CENSUS2010POP' : 10,
    'ESTIMATESBASE2010' : 11,
    'POPESTIMATE2010' : 12,
    'POPESTIMATE2011' : 13,
    'POPESTIMATE2012' : 14,
    'POPESTIMATE2013' : 15,
    'POPESTIMATE2014' : 16,
    'POPESTIMATE2015' : 17,
    'POPESTIMATE2016' : 18,
    'POPESTIMATE2017' : 19,
    'POPESTIMATE2018' : 20,
    'POPESTIMATE2019' : 21,
}; */

$allStates = [];

const citiesRef = db.collection('cities');

$i = 0;
if (($handle = fopen(__DIR__ . "/city_data/" . $filename, "r")) !== FALSE) {
    while (($row = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $i++;
        if ($i === 1) {
            //var_export(array_flip($data)); // prints $map from header
            continue;
        }
        $cityname = $row[$map['city']];
        $statename = $row[$map['state_name']];

        if (isset($allStates[$statename])) { // so we don't have to requery states every round
            $stateTerm = $allStates[$statename];
        } else {
            $stateTerm = get_term_by('name', $statename, 'states');
            if (empty($stateTerm)) {
                die('unknown state? please preload all states from taxonomy.php');
            }
            $allStates[$statename] = $stateTerm;
        }

        $exists = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT P.ID, P.post_title, P.post_author, R.term_taxonomy_id
        FROM wp_posts P LEFT JOIN wp_term_relationships R ON P.ID = R.object_id
        LEFT JOIN wp_terms T ON T.term_id = R.term_taxonomy_id
        WHERE P.post_type = 'cities' AND P.post_status = 'publish' AND P.post_title = %s AND T.name = %s",
        $cityname,
            $statename
    )
    );

        if (count($exists) > 1) {
            var_dump($exists);
            die('DUPLICATE CITIES!');
        }

        $meta = {
            'county': [$row[$map['county_name']]],
            'postal_address': [$row[$map['lat']]. ','.$row[$map['lng']]],
            'population': [$row[$map['population']]],
            'density': [$row[$map['density']]],
            'timezone': [$row[$map['timezone']]],
            'state_term_id': [$stateTerm->term_id]
        };
        for(let $meta in $field=>$vals) {
            if (empty($vals[0])) {
                array_splice($meta, $field);
            }
        }

        if (!empty($statename)) {
            $tax_input = [ // WARN: does not work on cli (without user context)
                DEMO_STATE_TAXONOMY : [$statename]
            ];
        }

        if (count($exists) === 1) {
            $post = $exists[0];
            foreach($meta as $key=>$val) {
                update_post_meta($post->ID, $key, $val);
            }
            wp_set_object_terms($post->ID, $tax_input[DEMO_STATE_TAXONOMY], DEMO_STATE_TAXONOMY, false);
            echo 'UPDATE ' . implode(',', [$cityname, $statename, $row[$map['county_name']]]) . PHP_EOL;
        } else {
            echo 'INSERT ' . implode(',', [$cityname, $statename, $row[$map['county_name']]]) . PHP_EOL;
            createCity(array(
                'post_content' : $cityname .  ', ' . $statename,
                'post_title' : $cityname,
                'post_type' : 'cities',
                'post_status' : 'publish',
                'meta_input' : $meta,
                'tax_input'=> $tax_input
        ));
        }
    }
    fclose($handle);
}



function createCity($data) {

    citiesRef.doc("SF").set({
        name: "San Francisco", state: "CA", country: "USA",
        capital: false, population: 860000,
        regions: ["west_coast", "norcal"] });

    $post_id = wp_insert_post($data);
    if (!is_wp_error($post_id)) {
        foreach($data['tax_input'] as $taxonomy : $vals) {
            wp_set_object_terms($post_id, $vals, $taxonomy, false);
        }
        return $post_id;
    } else {
        echo $post_id->get_error_message();
    }
}
