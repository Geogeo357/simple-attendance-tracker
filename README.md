## Project Description

This is a super simple attendance tracker page that fetches student and attendance information from an external API, loads it into a chart, and allows the user to drill into attendance by day or by student.

## Technical Features
This app is built on React with the Next.js framework.  

It takes advantage of states within React to handle responsive updates of elements on-screen as well as data pulled from the API.  

The app uses an external API, which returns the sample data hosted here: https://github.com/Geogeo357/sample_attendance_json/blob/main/db.json.  This is done by using the freely available my-json-server service, which reads the data the db.json file and returns it as if it were hosted on a server.  I used this because it essentially allows for a quick, editable JSON database.  The data is stored as a list of student objects and a list of attendance objects.  The student objects contain just an ID and Name for each student, and the attendance objects contain the Date and list of IDs of student present on that day.

The CSS and UI uses some basic boilerplate Tailwind CSS to look nice and modern within the context of web apps today.

## Functionality
The page automatically loads sample student data and attendance from the API.  It then processes and graphs the attendance data in the chart.  The chart is interactive and allows the user to select any one of the days to view the attendance per student on that day.  In addition, there is a dropdown to select individual students and see their attendance records.

## Running locally
Install Node.JS, clone this repo, navigate to the project directory and run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the webpage running.
