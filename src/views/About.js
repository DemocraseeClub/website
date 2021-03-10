import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';

export const TEAM = [
    {
        name: 'Polina',
        img: '/images/polina.png',
        tagline : 'Online Marketing Consultant',
        html: <div><p>I lived in Moscow, Russia until I was 14 years old. I didn't know any english, only some french I learned in middle school. My family moved to Staten Island, NY right after 9/11 and I went to school in Manhattan. The dust was still in the air. After a few years we moved to New Jersey and then South Jersey. When I was 16 years old my entrepreneurial father started a company with me. After 8 years of college, and building websites for my teachers and classmates, I moved to Los Angeles, California.</p>
            <p>I'm so glad to have had this cultural variety from my experience of moving around, because it allows me to look at politics from different angles. Political views in my family are split, and I didn't notice how much until I moved away and lived in California for a few years. Suddenly I found myself disagreeing with my parents on most major issues, such as climate change, healthcare, gun control - big topics suddenly seemed out of reach of agreement yet close to everyone's heart. We want the same things and have mutual goals, so why are our opinions so opposite?</p>
            <p>Through love and understanding, I'd like to find a form of discussion that is more productive than a facebook post with a political meme, or a family dinner full of yelling. What are the things we can actually affect and have a true impact on? What are the physical, informational and systematic issues that can be solved by crowd-sourcing data?</p>
            <p>For the past 12 years in Los Angeles I grew the company my dad helped open, and I won projects such as Coffee Bean & Tea Leaf online marketing, Dr. Phil website development, app projects using Qualcomm's early AR and VR API packages, played around with Google services, and up to this day I'm still learning better ways to develop, design and architect online experiences.</p>
            <p>I have a passion for simplicity and clarity. I believe that if we have clear goals - we can make a great tool to educate and empower voters. A tool that can help solve problems and make changes that one person can't solve alone.</p>
            <p>My goal in DemocraSEE is to engineer ways to improve communication between people and provide structure to decision-making interactions online and on mobile devices. I want people to be better equipped to make meaningful changes in their local communities.</p></div>
    },
    {
        name: 'Marcela',
        img: '/images/marcela.png',
        html: <div><p>When I was a little girl, and people would ask me what I wanted to be when I grew up, I would say the President of the United States. This dream came from a desire to help those in need, and make a difference in the world. I soon learned that was not an option for me, as a Brazilian-American born abroad. As the daughter of a single mother who was an immigrant, I realized that if I wanted something better for myself and the future of my family, I would need to work for it. And so instead of feeding into a system of college loans and degrees that I would potentially spend years paying back, I decided to use my passion for service and join the US Navy. My efforts to be a good student quickly paid off, and I was able to take a highly valued career field in IT and Cyber Security. I spent 14 years working on both defensive and threat intelligence cyber operations for the Department of Defense as both a Sailor and government contractor, and eventually took an opportunity to venture overseas and help the UAE government establish their National Cyber Security Center.</p>
            <p>In Abu Dhabi, I learned so much about the true freedoms and opportunities provided to me as an American. It was truly a fruitful experience to share my knowledge and experiences with the amazingly bright and talented local women I worked with. As I saw these women flourish in their roles, I realized any positive impact, no matter how small, can have a long and lasting effect on others.</p>
            <p>After 20 years of working in Cybersecurity as a service member, consultant for foreign nations and cybersecurity companies, and a product manager looking to develop innovative tools to help secure IT environments, I now understood the implications and threats of using technology as part of everyday life. Today, I aim to fight these threats not only as a cybersecurity professional, but as an advocate of civic engagement to drive the changes needed in order for technology to be utilized for positive initiatives, without the corruption or interference of greed and personal agendas.</p>
        </div>
    },
    {
        name: "Eli",
        img: '/images/eli.png',
        html: <div><p>In 2002 I began building web pages and email blasts for concerts and parties I was promoting around San Francisco. Despite several successful turnouts, I was a terrible professional promoter, so shifted my focus full time to the logistical sides of the entertainment industry. Flash sites were fun and introduced me to ActionScript, mySQL and Apache through gigs with the BCBG Max Azria Group as well as various startups around California.</p>
            <p>I spent the next few years growing my skills up and down the stack, leveraging everything from JavaScript to Java, mostly with the medical search engine Healthline Networks. While I was growing my skills, none of the work was particularly rewarding. So I moved to Bogota, Colombia to learn Spanish, the guitar, and launch a gamified music app.</p>
            <p>Aunque no soy Neruda, yo sigo aprendiendo la idioma. As well, the soft launch of my app received great engagement from a small test group of 400 friends. However, I wasn't convinced there was a profitable opportunity within reach; so I redirected efforts towards my education and freelance development, moving on to MongoDB, Node.js and React.js</p>
            <p>After a few more years of the tech nomad life, I resettled on Kauai to help my father keep our home through WOOF'ing and agro-tourism on the side. Eventually our profit margins were marginalized by the county's position on AirBnB. So we've continued efforts to marry technology and subsistence farming through <a href='https://ruhralfarms.com' target='_blank'rel="noopener noreferrer">ruhralfarms.com</a></p>
            <p>After returning to the Bay Area in 2017 I was awarded a two year contract with Cypher LLC to build the site and tech transfer platform for our federally funded laboratories: FederalLabs.org. Since then I've remained with Cypher, now building safety reporting tools for our aviation industry with <a href="https://www.wbat.org" target="_blank" rel="noopener noreferrer">WBAT.org</a>.</p>
            <p>Today, I am reviving my music app - <a href="https://TrackAuthorityMusic.com" target='_blank' rel="noopener noreferrer">TrackAuthorityMusic.com</a> - while dreaming of old age farming, building furniture, and finally learning the guitar. To help secure that future, I see DemocraSee as a platform to transfer our collective energy and rage online into political action and programs for communities to grow our own peer-to-peer economies and culture.</p>
        </div>
    },
    {
        name: "Indy",
        img: '/images/indy.png',
        html: <div><p>Hi, one of the most common ways to identify me is as Indy Rishi Singh. Thank you for taking the time to explore who I am. I hope I pass your judgement as someone who cares about endlessly improving my state of being and improving the conditions of being within others around me.</p>
            <p>In high school, I earned a 4.21 GPA. It catapulted me towards a journey into medical school at St. George's University. I was a part of a quintessential immigrant's story - the son of a carpenter artist and a hard working mother. Medical school wasn't for me. I failed at it physically and mentally, finding myself sliding down a hole of despair and eventually towards suicide.</p>
            <p>My mother saved my life and introduced me to meditation and a spiritual connection to hope and possibility. My journey switched to working in education while autodidactically learning Ayurveda and holistic medicine. I eventually positioned myself to move to Manhattan. While working as a teacher in NYC, I tried my hand at Broadway, the film production industry, and even Wall Street. I even became director of a creative monastery in Midtown East, Manhattan for 3 years, where we built community around health, science, art, and humanity.</p>
            <p>After 7 years in Manhattan, and a couple developing and implementing curriculum for homeschool centers in Florida, I moved to LA where I started hosting and facilitating well-being exercises in workshops, seminars, conferences, and festivals. I've facilitated a well-being think tank connecting various facilitators while producing unique therapies and mindfulness techniques bridging Eastern and Western sciences and philosophies. I'm regularly asked to share these tools for resiliency at corporations, organizations, and communities. www.iLiving.guru</p>
            <p>In 2019, I decided to take matters into my own hands and attend a San Francisco City Hall meeting. During the meeting, I was able to meet and have a meaningful discussion with the Chief of Police. That led to a series of meetings at the SFPD HQ. Eventually I was able to lead a 6 week mindfulness series that was featured by ABC News. That prompted me to become a lot more passionate about being involved in local government and politics. I realized that my active and creative involvement does lead to meaningful action.</p>
            <p>DemocraSEE is the culmination of that passion and inquiry into the political system. In my opinion, people are powerful locally, within their communities and together. People in different places have different needs, and giving them an opportunity to connect with each other, with the intention to improve their lives and the lives of their neighbors, goes beyond partisan politics. Also, I am so happy and grateful to collaborate and council with the diverse group of people on this project. It means a lot that we include different viewpoints and backgrounds, so that we can honor the diversity of thought that is in our society.</p>
            <p>https://www.linkedin.com/in/indyrishisingh</p>
            </div>
    }
]


class About extends React.Component {

    scrollTo(t) {
        document.getElementById('teamstory-' + t.name).scrollIntoView({block:'start', behavior:'smooth'})
    }

    render() {
        // const {classes} = this.props;

        return (
            <div style={{marginTop:30, marginBottom:30}}>
                <h1 style={{textAlign:'center', marginBottom:40}}>Board of Directors</h1>
                <Grid container justify={'space-around'} alignContent={'center'}>
                    {TEAM.map(t =>
                        <Grid item  key={t.name} style={{textAlign:'center', cursor:'pointer'}} onClick={e => this.scrollTo(t)}>
                            <Avatar alt={t.name} src={t.img} className={this.props.classes.large} />
                            <p>{t.name}</p>
                        </Grid>
                    )}
                </Grid>

                {TEAM.map(t => {
                    return <Paper key={t.name} id={'teamstory-' + t.name} style={{padding:10, margin:'20px 10px'}}>
                        <Grid container >
                            <Grid item xs={1} >
                                <Avatar alt={t.name} src={t.img} />
                            </Grid>
                            <Grid item xs={11}>
                                {t.html}
                            </Grid>
                        </Grid>


                    </Paper>
                })}
                <Grid>

                </Grid>
            </div>
        );
    }

}


const useStyles = theme => ({
    root: {
        width: '100%',
    },
    large: {
        width: 100,
        height: 100,
    },
});

export default withStyles(useStyles, {withTheme: true})(About);
