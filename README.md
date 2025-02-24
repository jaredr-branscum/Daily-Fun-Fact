# Daily Fun Fact Website

This project is a simple website that displays daily fun facts. It features a home page showcasing the fun fact of the day and an archive page where users can explore fun facts from the past.

## Capabilities

### Home Page

The home page (`/`) displays the fun fact for the current day.  It fetches this data from a JSON file located in the `data` directory. The date is automatically determined, ensuring a new fun fact is displayed each day.

### Archive Page

The archive page (`/archive`) allows users to browse fun facts from previous days. It provides two dropdown menus:

*   **Year Selection:**  Users can select a year from a dropdown to narrow down their search.
*   **Month Selection:** Users can select a month to further refine the results.

After selecting a year and month, the page displays all fun facts available for that specific period. If no fun facts are found for the selected year and month, a message banner to indicate they're unavailable.

## Data Format

Fun fact data is stored in JSON files within the `data` directory. The directory structure is `data/year/month/dd-mm-yyyy.json`.  Each JSON file contains the following structure:

```json
{
  "fact": "The actual fun fact text.",
  "topic": "The topic of the fun fact.",
  "category": "The category of the fun fact.",
  "tags": ["tag1", "tag2"],
  "didYouKnow": "Additional information.",
  "references": [{ "title": "Reference Title", "url": "Reference URL" }],
  "placeholder": false // Or true if it's a placeholder fact
}
```
Note: the placeholder boolean does not have any functionality, but this was added in the initial design to support adding fun facts for future dates that are not yet revealed. This field would be deprecated if the application is redesigned to pull the fun facts from an external source such as Object Storage or Cloud database.