import { useState } from "react";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useParams,
} from "react-router-dom";
import { Anime } from "./anime";
import { useEffect } from "react";
import { Animes } from "./search";

Chart.register(ArcElement, Tooltip, Legend);

export function dashboardLoader({ request }) {
  console.log("dashboard loader", request);

  return { title: "haaaaaaaaaaaa" };
}

async function computeStinkiness(anime) {
  let promiseList = [];
  console.log(anime);
  console.log("title", anime.title);
  //BanWords points
  promiseList.push(
    fetch("http://localhost:4200/purgoAnimeum?search=", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // You can add other headers as needed
      },
      body: JSON.stringify({ text: anime.title }),
    })
      .then((res) => {
        return res.json();
      })
      .then((response) => {
        console.log("Title = " + response.count);
        let nameBans = response.count * 5;
        return { id: "1", points: nameBans };
      })
  );

  //Concatener toutes les valeurs en une string pour ne pas avoir de problèmes d'objets
  let concatenatedRecommendations = "";

  for (const rec of anime.recommendations) {
    concatenatedRecommendations += rec.text;
  }
  console.log("rec text", concatenatedRecommendations);
  promiseList.push(
    //Ne va peut-être pas marcher (liste d'objets js)
    fetch("http://localhost:4200/purgoAnimeum?search=", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // You can add other headers as needed
      },
      body: JSON.stringify({ text: concatenatedRecommendations }),
    })
      .then((res) => {
        return res.json();
      })
      .then((response) => {
        console.log("Recommendations = " + response.count);
        let recommendationsBans = response.count * 2;
        return { id: "2", points: recommendationsBans };
      })
  );

  promiseList.push(
    fetch("http://localhost:4200/purgoAnimeum?search=", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // You can add other headers as needed
      },
      body: JSON.stringify({ text: anime.desc }),
    })
      .then((res) => {
        return res.json();
      })
      .then((response) => {
        console.log(response);
        console.log("Desc = " + response.count * 2);
        const descBans = response.count * 2;
        return { id: "3", points: descBans };
      })
  );

  let tagsNDesc = "";

  for (const tag of anime.tags) {
    tagsNDesc += tag.name + " " + tag.desc;
  }

  promiseList.push(
    //Ne va peut-être pas marcher (liste d'objets js)
    fetch("http://localhost:4200/purgoAnimeum?search=", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // You can add other headers as needed
      },
      body: JSON.stringify({ text: tagsNDesc }),
    })
      .then((res) => {
        return res.json();
      })
      .then((response) => {
        console.log("Desc = " + response.count * 0.5);
        let tagsBans = response.count * 0.5;
        return { id: "4", points: tagsBans };
      })
  );
  promiseList.push(
    fetch("http://localhost:4200/purgoAnimeum?search=", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // You can add other headers as needed
      },
      body: JSON.stringify({ text: anime.characters.join() }),
    })
      .then((res) => {
        return res.json();
      })
      .then((response) => {
        console.log("Desc = " + response.count * 3);
        let charactersBans = response.count * 1;
        return { id: "5", points: charactersBans };
      })
  );

  //Recommendations points
  //Points on number of recommendations
  let recommendationsPoints = 0;
  if (anime.recommendations.length < 6) {
    recommendationsPoints += 10;
  } else if (anime.recommendations.length < 16) {
    recommendationsPoints += 5;
  }

  //Points on recommendations ranking
  let forFansCount = 0;
  let recommendedCount = 0;
  let mustWatchCount = 0;
  for (const opinion of anime.recommendations) {
    if (opinion.rank.toLowerCase() === "recommended") {
      recommendedCount++;
    } else if (opinion.rank.toLowerCase() === "for fans") {
      forFansCount++;
    } else if (opinion.rank.toLowerCase() === "must watch") {
      mustWatchCount++;
    }
  }
  console.log(
    "Number of for fans : " +
      forFansCount +
      "\nNumber of recommended : " +
      recommendedCount +
      "\nNumber of must watch : " +
      mustWatchCount
  );

  if (forFansCount > recommendedCount) {
    recommendationsPoints += 5;
  } else if (forFansCount > mustWatchCount) {
    recommendationsPoints += 10;
  }
  if (forFansCount > recommendedCount + mustWatchCount) {
    recommendationsPoints += 15;
  }
  if (recommendedCount > mustWatchCount) {
    recommendationsPoints += 5;
  }

  //Points on number of episodes
  let episodeCountPoints = 0;
  if (anime.episode_count > 20) {
    episodeCountPoints += 0.5 * (episode_count - 20);
  }

  let stinkList = [];
  await Promise.all(promiseList).then((stinkLst) => {
    console.log("lst", stinkList);
    for (const elem of stinkLst) {
      stinkList.push(elem);
    }
  });
  stinkList.push({ id: "6", points: recommendationsPoints });
  stinkList.push({ id: "7", points: episodeCountPoints });

  let stinkiness = recommendationsPoints + episodeCountPoints;
  for (const element of stinkList) {
    stinkiness += element.points;
  }
  stinkList.push({ id: "0", points: stinkiness });

  console.log(stinkList);

  return stinkList;
}

export function Dashboard() {
  const [anime_list, setAnime_list] = useState([]);

  const testAnime = {
    id: "2722",
    title: "Beautiful Girl Comic Lolita Complex Angel: Taste of Honey",
    episode_count: "1",
    type: "OVA",
    related: [],
    similar: [],
    recommendations: [
      {
        text: "uh...",
        rank: "Recommended",
      },
    ],
    desc: "Three young girls try to identify a thief who stole money from one of them. There are three suspects and each girl investigates them separately. The suspects are: a girl from their class with a secret connection to her teacher, a young boy from their class who`s in love with the girl that investigates him, and an old man from school who mistakes the girl that investigates him as his daughter.\nSource: MyAnimeList",
    picture: "276660.jpg",
    tags: [
      {
        name: "maintenance tags",
        desc: "These tags are used for maintenance.",
      },
      {
        name: "shota",
        desc: "Shotacon, sometimes shortened to shota, is a Japanese slang portmanteau of the phrase Shoutarou complex and describes an attraction to young boys, or an individual with such an attraction. Outside Japan, the term is less common and most often refers to a genre of manga and anime wherein pre-pubescent or pubescent male characters are depicted in a suggestive or erotic manner.\nIn a general sense, this is the same as http://anidb.net/t2566 [loli], just replace young girls with young boys.\n[Source: wiki]",
      },
      {
        name: "loli",
        desc: 'Lolita (often also just abbreviated to loli) refers originally to a novel by Vladimir Nabokov. The book is internationally famous for its controversial subject: the narrator and protagonist, middle aged Humbert Humbert, becomes obsessed and sexually involved with a 12-year-old girl named Dolores Haze.\nNowadays the name "Lolita" describes a sexually precocious young girl.\nRelated to this is http://anidb.net/t2415 [lolicon], the Japanese abbreviation of the English phrase "Lolita Complex". Sometimes written as "roricon" or "rorikon" due to the inexact mapping between Japanese and English phonemes. This is the term used to describe the fetish/fascination some mature people have for underage girls. There is an entire industry in Japan devoted to providing legal but schoolgirl-themed pornography, taking advantage of the cute childlike appearance some Japanese women maintain well into their twenties.\nBecause the characters in anime are often young by convention, many fans think that a character can only be Lolicon if she is twelve or younger. Exceptions are granted if the other character in the relationship is a lot older.\nOne particular device used to skirt the boundaries of taste and legality is the exotic being (alien, creature of magic, robot or the like) which takes the form of an underage human girl, but is in fact for all other practical purposes an adult.\nAnother reason why lolicon is fetishized by people may be because some of them just view it as a substitute for their fetish for flat-chested, but otherwise well-developed, women.\nSource: Wikipedia / TV Tropes',
      },
      {
        name: "content indicators",
        desc: "The content indicators branch is intended to be a less geographically specific tool than the `age rating` used by convention, for warning about things that might cause offence. Obviously there is still a degree of subjectivity involved, but hopefully it will prove useful for parents with delicate children, or children with delicate parents.\nNote: Refer to further guidance on http://wiki.anidb.net/w/Categories:Content_Indicators [the Wiki page] for how to apply tag weights for content indicators.",
      },
      {
        name: "target audience",
        desc: "Anime, like everything else in the modern world, is targeted towards specific audiences, both implicitly by the creators and overtly by the marketing. While categories are associated with specific sex and age groups, this is not a bar on the anime being enjoyed by people who don`t fit into that band; not only do crossover titles exist, but the categories also have a considerable following outside their main demographic, and a person might as well enjoy anime from all categories. Still, does not invalidate the usefulness of marking a title as one of the categories; the same themes will likely be treated differently in anime geared for different audiences. Only one should not jump the gun and assume that a title will be more or less serious or present content in this or that way due to its target audience, or conversely assume the target audience on the content and its presentation alone. As such, the audience categories help form a broad impression of how a title might work with the announced themes, but offer little to no in-depth information about specific content or its treatment.\nThe audience categories originate from manga magazines, which group titles of a same intended audience into a magazine that is advertised as belonging to that category, and so manga-based anime will have the category from their parent work. As for anime based on other works, the audience is often debatable, but comparing information such as time slot to the manga-based anime generally helps figure out the most likely possibility.\nIf the parent material was classified under multiple audiences over time (for example, it was originally shounen, but then as the plot changed and became more mature, it was reclassified as seinen), and the anime adapts parent material time periods covering multiple audiences, we tag all audiences covered by the anime adaptation.",
      },
      {
        name: "fetishes",
        desc: "For non-porn anime, the fetish must be a major element of the show; incidental appearances of the fetish is not sufficient for a fetish tag. Please do not add fetish tags to anime that do not pander to the fetish in question in any meaningful way. For example, there`s some ecchi in http://anidb.net/a22 [Shinseiki Evangelion], but the fact you get to see http://anidb.net/ch39 [Asuka]`s pantsu is not sufficient to warrant applying the http://anidb.net/t2894 [school girl] fetish tag. See also the http://wiki.anidb.net/Tags#Minimum_Relevance_Rule [minimum relevancy rule].\nFor porn anime, the application of fetish tags are fairly straightforward, as porn will fully play out most fetishes.",
      },
      {
        name: "original work",
        desc: "What the anime is based on! This is given as the original work credit in the OP. Mostly of academic interest, but a useful bit of info, hinting at the possible depth of story.",
      },
      {
        name: "setting",
        desc: "The setting describes in what time and place an anime takes place. To a certain extent it describes what you can expect from the world in the anime.",
      },
      {
        name: "elements",
        desc: 'Next to Themes setting the backdrop for the protagonists in anime, there are the more detailed plot Elements that centre on character interactions: "What do characters do to each other or what is done to them?". Is it violent Action, an awe-inspiring Adventure in a foreign place, the gripping life of a Detective, a slapstick Comedy, an Ecchi Harem anime, a SciFi epic, or some Fantasy travelling adventure?',
      },
      {
        name: "time",
        desc: "This placeholder lists different epochs in human history and more vague but important timelines such as the future, the present and the past.",
      },
      {
        name: "place",
        desc: "The places the anime can take place in. Includes more specific places such as a country on Earth, as well as more general places such as a dystopia or a mirror world.",
      },
      {
        name: "18 restricted",
        desc: 'This isn`t really an "audience".\nWhile some anime might feature sexual content they still might not be considered pornography. This category is meant only for when the content is clearly *not* intended for minors. The distinction is made by whether the content is sold only to adults.',
      },
      {
        name: "present",
        desc: "Somewhere between past and future.",
      },
      {
        name: "Earth",
        desc: "The Earth is the third planet from the Sun, and the densest and fifth-largest of the eight planets in the Solar System. It is in effect a ball of hot mud, but on the surface it`s cold enough, so most of us live on it (or are supposed to). It is circa 4.5 billion years old, and, unless we humans succeed in destroying it over the next couple of centuries, it is expected to last for quite another while, though the changes in the Sun`s emissions due to its aging will likely cause the extinction of everything; the species of earthlings are guaranteed to die, even if we fail to kill them -- unless, of course, we find ourselves another planet and figure out a way to take everything there. Our little planet on a corner of this galaxy may mean nothing in the grand scheme of things, but to its inhabitants it is their home, so, as a species, we cherish it dearly, to the point many cultures even to this day deify it. Being the home to the human civilizations, the Earth is the main setting of most fiction, be it anime or otherwise, but not only are many titles set in other places, such as unrelated fantasy worlds, in a considerable number of fictional titles the Earth is actually destroyed by aggressive alien invaders.",
      },
      {
        name: "Japan",
        desc: "Japan is a sovereign island nation in East Asia. Located in the Pacific Ocean, it lies off the eastern coast of the Asian mainland and stretches from the Sea of Okhotsk in the north to the East China Sea and China in the southwest.\nSource: Wikipedia",
      },
      {
        name: "yuri",
        desc: "Yuri refers to anime that portray lesbian (female/female) sex. Do not confuse this with the http://anidb.net/t2782 [Shoujo Ai] category under Romance, which only portrays girl/girl relationships, but generally not anything pornographic. This is real female/female porn.\nThe male version is http://anidb.net/t2723 [Yaoi].\nhttp://anidb.net/t7146 [Cute girls doing cute things (CGDCT)] is often mistaken as low level Yuri or Shoujo Ai. If there is no Yuri or Shoujo Ai subtext, i.e. if there is no romantic subtext, only tag CGDCT. Please note: CGDCT and yuri/shoujo ai are not mutually exclusive; it is possible to have an anime tagged both.",
      },
      {
        name: "uncensored version available",
        desc: "There`s an uncensored version available of the porn anime this tag is added to, which in most cases means, that there was a region 1 DVD (R1 DVD = North America) release.",
      },
      {
        name: "urination",
        desc: "Urination, also known as micturition, voiding, peeing, weeing, pissing, and more rarely, emiction, is the ejection of urine from the urinary bladder through the urethra to the outside of the body. In healthy humans the process of urination is under voluntary control. In infants, some elderly individuals, and those with neurological injury or extreme psychological problems, urination may occur as an involuntary reflex. In other animals, in addition to expelling waste material, urination can mark territory or express submissiveness.",
      },
      {
        name: "oral",
        desc: "Oral sex is sexual activity involving the stimulation of the genitalia of a sex partner by the use of the mouth, tongue, teeth or throat.",
      },
      {
        name: "rape",
        desc: "Rape means to force someone to engage in sexual interaction without their consent. If the rape is not successfully executed (both fellatio and penetration did not occur), tag with http://anidb.net/t7238 [attempted rape] instead.",
      },
      {
        name: "BDSM",
        desc: 'A form of "kinky sex". The acronym BDSM derives from BD (bondage and discipline), DS (dominance and submission) and SM (sadism and masochism). BDSM usually characterizes with one side being superior (active) over the other (passive), with each side being one or more participants. Whips, chains, handcuffs, ropes, blindfolds are common elements of BDSM.',
      },
      {
        name: "female rapes female",
        desc: "Both the perpetrator and victim are female; a same-sex rape results.",
      },
      {
        name: "sex",
        desc: 'Sexual intercourse, the ultimate bond of love and the "Origin of the World" (just think of Gustave Courbet`s painting: http://en.wikipedia.org/wiki/L%27Origine_du_monde).\nNote: Refer to further guidance on http://wiki.anidb.net/w/Categories:Content_Indicators [the Wiki page] for how to apply tag weights for content indicators.',
      },
      {
        name: "new",
        desc: "Not based on anything, the story is a new work, usually made up by the people involved in creating the anime. Generally if an original work (原作) credit is given, it will be to the studio, or director, or other members of the production team.",
      },
      {
        name: "Asia",
        desc: "Asia is Earth`s largest and most populous continent, located primarily in the eastern and northern hemispheres and sharing the continental landmass of Eurasia with the continent of Europe. Asia covers an area of 44,579,000 square kilometers, about 30% of Earth`s total land area and 8.7% of the Earth`s total surface area. The continent, which has long been home to the majority of the human population, was the site of many of the first civilizations. Asia is notable for not only its overall large size and population, but also dense and large settlements as well as vast barely populated regions within the continent of 4.4 billion people.\nSource: Wikipedia",
      },
      {
        name: "pornography",
        desc: 'Anime clearly marked as "Restricted 18" material centring on all variations of adult sex, some of which can be considered as quite perverted. To certain extent, some of the elements can be seen on late night TV animations.',
      },
      {
        name: "female student",
        desc: "Pretty much exclusive to hentai shows only unless an ecchi show has implied sex and/or a strong indicator of nudity. A character is considered a student if she goes to school, doesn`t matter if it`s high school, college or homeschooling, but she should be of appropriate age for a student; a housewife going to college should not get this category.",
      },
      {
        name: "bondage",
        desc: "Bondage is the use of restraints for the sexual pleasure of the parties involved. It may be used in its own right, as in the case of rope bondage and breast bondage, or as part of sexual activity or BDSM activity. When a person is sexually aroused by bondage, it may be considered a paraphilia, known as vincilagnia (from Latin vincio, to bind or fetter with chains, and lagneia, lust).\n[Source: wiki]",
      },
      {
        name: "erotic torture",
        desc: "Erotic torture involves deliberately using (almost) any form of physical or excessive psychological abuse to inflict physical and/or mental pain, with the goal of inducing sexual pleasure. Examples include, among others, hot wax on skin, nipple clamps, electricity, extreme verbal and derogatory abuse, forced public exhibition, etc.\nThis is distinct from the common, non-erotic http://anidb.net/t6730 [torture], which is generally for the purpose of inflicting pain, to either fulfill a desire of the torturer, or to apply coercion to compel action from the victim.",
      },
      {
        name: "cunnilingus",
        desc: "Cunnilingus is an oral sex act performed on a female. It involves the use by a sex partner of the mouth, lips and tongue to stimulate the female`s clitoris and vulva. A female may receive cunnilingus as part of foreplay before sexual intercourse, or the sex partner may proceed until the female reaches orgasm.\nThe term is derived from the Latin words for the vulva (cunnus) and tongue (lingua).",
      },
      {
        name: "CAST MISSING",
        desc: "Important characters are missing, either in-part or entirely. This includes basic entry info (name, gender, picture), appear episode range, seiyuu and/or tags.",
      },
      {
        name: "technical aspects",
        desc: "It may sometimes be useful to know about technical aspects of a show, such as information about its broadcasting or censorship. Such information can be found here.",
      },
      {
        name: "origin",
        desc: "",
      },
      {
        name: "fellatio",
        desc: "Fellatio is oral sex performed upon the penis. It may be performed to induce male orgasm and ejaculation of semen, or it may be used as foreplay prior to sexual intercourse.",
      },
      {
        name: "sexual abuse",
        desc: "Sexual abuse is the act of one person forcing sexual activities upon another. Sexual abuse includes not only physical coercion and sexual assault, especially rape, but also psychological abuse, such as verbal sexual behaviour or stalking, including emotional manipulation.",
      },
      {
        name: "Japanese production",
        desc: "",
      },
    ],
    characters: ["", ""],
  };

  //console.log(computeStinkiness(testAnime));

  function onAddAnime(anime) {
    const ids = anime_list.map((a) => a.id);
    if (!ids.includes(anime.id)) {
      // check if anime is already selected to avoid duplicates
      setAnime_list((prevArray) => [...prevArray, anime]);
    }
  }

  return (
    <>
      <Animes addAnime={onAddAnime} />
      <Doughnutchart></Doughnutchart>
      <br />
      <UserAnimes anime_list={anime_list}></UserAnimes>
    </>
  );
}

export function Doughnutchart() {
  //Data that will be used in the doughnutChart
  //Will need to be changed based on UserAnimes list

  const data = {
    labels: ["Yes", "No"],
    datasets: [
      {
        label: "Poll",
        data: [3, 6],
        backgroundColor: ["black", "red"],
        borderColor: ["black", "red"],
      },
    ],
  };

  const options = {};
  return (
    <div style={{ width: "50%", height: "50%" }}>
      <Doughnut data={data} options={options}></Doughnut>
    </div>
  );
}

export function UserAnimes({ anime_list }) {
  console.log("anime_list in user", anime_list);
  return (
    <>
      <h3>Selected animes</h3>
      <ul>
        {anime_list.map((anime) => {
          return <Anime key={anime.id} anime={anime}></Anime>;
        })}
      </ul>
    </>
  );
}
