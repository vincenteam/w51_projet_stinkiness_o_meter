const base_anidb_images_url = "https://cdn-eu.anidb.net/images/main/"



export function Anime({ anime }) {
  return (
    <>
      <span>{anime.title}</span>
      <img src={base_anidb_images_url+anime.picture} alt="anime thubnail" />
    </>
  );
}
