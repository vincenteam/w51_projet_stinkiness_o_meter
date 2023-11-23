const base_anidb_images_url = "https://cdn-eu.anidb.net/images/main/"



export function Anime({ anime }) {
  //const pictureLink = base_anidb_images_url + anime.picture;
  return (
    <>
      <span>{anime.title}</span>
      {/*<img src={ pictureLink } alt="anime thubnail" />*/}
    </>
  );
}
