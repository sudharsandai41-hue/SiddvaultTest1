

export interface SiddvaultData {
  siddvault_metadata: {
    record_id: string;
    date_catalogued: string;
    catalogued_by: string;
    confidence_score: string;
    cover_image?: string; // Added for Gallery display
  };
  core_identity: {
    album_title: string;
    album_title_original_script: string;
    album_title_transliteration: string;
    artist_primary: string;
    music_director: string;
    film_name: string;
    film_name_transliteration: string;
    label_name: string;
    catalogue_number: string;
    matrix_runout_a: string;
    matrix_runout_b: string;
    country_of_pressing: string;
    pressing_plant: string;
    year_of_release: string;
    format: string;
    rpm: string;
    stereo_mono: string;
  };
  edition_details: {
    edition_type: string;
    pressing_number: string;
    is_original_pressing: boolean;
    pressing_significance: string;
    variant_notes: string;
  };
  track_listing: {
    side_a: (string | TrackObject)[];
    side_b: (string | TrackObject)[];
  };
  credits: {
    composer: string;
    lyricists: string[];
    singers: string[];
    musicians: string[];
    producer: string;
    recording_engineer: string;
    mastering_engineer: string;
    cover_designer: string;
  };
  genre_classification: {
    primary_genre: string;
    secondary_genre: string;
    musical_style: string;
    cultural_category: string;
  };
  condition_grading: {
    vinyl_grade: string;
    sleeve_grade: string;
    inner_sleeve: string;
    label_condition: string;
    surface_marks: string;
    warping: string;
    audio_quality: string;
    surface_noise_level: string;
    ring_wear: string;
    edge_wear: string;
    seam_splits: string;
    writing_on_cover: string;
    special_damage_notes: string;
  };
  preservation_tracking: {
    needs_cleaning: boolean;
    cleaned_date: string;
    cleaning_method: string;
    needs_new_outer_sleeve: boolean;
    needs_new_inner_sleeve: boolean;
    restoration_required: boolean;
    restoration_notes: string;
    storage_location: string;
    environmental_concerns: string;
  };
  collector_intelligence: {
    rarity_level: string;
    rarity_explanation: string;
    desirability_score: string;
    collector_demand: string;
    pressing_importance: string;
    special_features: string;
  };
  cultural_historical: {
    album_trivia: string;
    film_trivia: string;
    director_info: string;
    box_office_performance: string;
    awards_won: string[];
    composer_career_context: string;
    recording_trivia: string;
    cultural_significance: string;
    era_context: string;
    musical_highlights: string;
    iconic_songs: string[];
    cover_art_story: string;
    label_history: string;
    pressing_story: string;
  };
  digital_integration: {
    spotify_album_id: string;
    spotify_link: string;
    spotify_availability: string;
    youtube_link: string;
    apple_music_link: string;
    discogs_release_id: string;
    discogs_link: string;
    musicbrainz_id: string;
  };
  display_curation: {
    display_priority: string;
    frame_worthy: boolean;
    visual_appeal: string;
    collection_category: string;
    shelf_location: string;
    exhibition_notes: string;
    instagram_potential: string;
    story_potential: string;
  };
  personal_memory: {
    memory_tag: string;
    emotional_significance: string;
    acquisition_story: string;
    first_heard: string;
    personal_connection: string;
    memoir_snippet: string;
  };
  content_generation: {
    instagram_caption: string;
    instagram_hashtags: string[];
    reel_script: string;
    story_post_text: string;
    blog_excerpt: string;
  };
  tags: string[];
}

export interface TrackObject {
  track_number?: string;
  title?: string;
  title_original_script?: string;
  singers?: string[] | string;
  lyricist?: string[] | string;
}

export type ImageCategory = 'front' | 'back' | 'labelA' | 'labelB';

export interface UploadedImage {
  file: File;
  preview: string;
  category: ImageCategory;
}
