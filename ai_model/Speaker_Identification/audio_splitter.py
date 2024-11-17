from moviepy.editor import AudioFileClip
import os

def split_audio(input_file, output_folder, segment_duration=1, target_sr=16000, codec="pcm_s16le"):
    """
    Splits audio from an input file into smaller segments with a target sampling rate and hop length.

    Parameters:
        input_file (str): Path to the input .mp4 file.
        output_folder (str): Directory to save the .wav segments.
        segment_duration (int): Duration of each segment in seconds.
        target_sr (int): Target sampling rate (in Hz).
        codec (str): Codec to use for audio export.
    """
    # Load the audio from the .mp4 file
    audio_clip = AudioFileClip(input_file)
    
    # Get the total duration of the audio in seconds
    total_duration = int(audio_clip.duration)
    
    # Ensure output folder exists
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # Loop through the duration, saving each segment as a .wav file
    for i in range(0, total_duration, segment_duration):
        if i > 1500:
            break
        # Define start and end times for the segment
        start_time = i
        end_time = min(i + segment_duration, total_duration)
        
        # Extract the segment
        segment = audio_clip.subclip(start_time, end_time)
        
        # Resample and save the segment as a .wav file with the target sample rate
        segment_file = os.path.join(output_folder, f"{i}.wav")
        segment.write_audiofile(
            segment_file,
            codec=codec,
            fps=target_sr,  # Set target sampling rate
            ffmpeg_params=["-ac", "1"]  # Convert to mono if needed
        )
        print(f"Saved segment: {segment_file} at {target_sr} Hz")
    
    # Close the audio clip to release resources
    audio_clip.close()
    print("All segments have been saved.")

# Example usage
input_mp4_file = "/home/bhanu/Downloads/CyberAI Class-10Sept2024_Recording.mp4"
output_directory = "./segments"
split_audio(input_mp4_file, output_directory)
