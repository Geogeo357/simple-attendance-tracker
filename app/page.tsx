// app/page.tsx
"use client"; // This component needs to be a client component for useState, useEffect, and recharts

import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// All our data types

// Student
interface Student {
  id: number;
  name: string;
}

// Raw Attendance Data
interface AttendanceRawData {
  date: string;
  present: number[]; // which students were present
}

// Processed Attendance for Chart
interface ProcessedChartDataPoint {
  date: string; // "MM-DD" for display
  originalDate: string; // "YYYY-MM-DD" for lookups
  attendancePercentage: number;
  presentStudentIds: number[];
  presentStudentNames?: string[]; // Optional: populated when bar is clicked
}

export default function HomePage() {
  // student and attendance variables
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [rawAttendance, setRawAttendance] = useState<AttendanceRawData[]>([]);
  const [processedChartData, setProcessedChartData] = useState<ProcessedChartDataPoint[]>([]);

  // loading and error states
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // selected day or student for drilling into attendance
  const [selectedBarDate, setSelectedBarDate] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(""); // Store as string for select value

  // Fetching RAW Data from API (processing of data is done separately)
  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const studentApiResponse = await fetch('https://my-json-server.typicode.com/Geogeo357/sample_attendance_json/students');
        if (!studentApiResponse.ok) {
          throw new Error('Failed to fetch attendance data');
        }
        const studentData: Student[] = await studentApiResponse.json();
        setAllStudents(studentData);
      } catch (err) {
        setError("Failed to fetch students.");
        console.error(err);
      } finally {
        setLoadingStudents(false);
      }
    };

    const fetchRawAttendance = async () => {
      setLoadingAttendance(true);
      try {
        const attendanceApiResponse = await fetch('https://my-json-server.typicode.com/Geogeo357/sample_attendance_json/attendances');
        if (!attendanceApiResponse.ok) {
          throw new Error('Failed to fetch attendance data');
        }
        const attendanceData: AttendanceRawData[] = await attendanceApiResponse.json();
        setRawAttendance(attendanceData);
      } catch (err) {
        setError("Failed to fetch attendance logs.");
        console.error(err);
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchStudents();
    fetchRawAttendance();
  }, []);


  // Data Processing to get percentage of attendance for the Chart
  useEffect(() => {
    if (allStudents.length > 0 && rawAttendance.length > 0) {
      const totalStudents = allStudents.length;
      const chartData = rawAttendance.map(log => {
        const percentage = totalStudents > 0 ? (log.present.length / totalStudents) * 100 : 0;
        return {
          date: log.date.substring(5), // "MM-DD"
          originalDate: log.date, // "YYYY-MM-DD"
          attendancePercentage: parseFloat(percentage.toFixed(1)),
          presentStudentIds: log.present,
        };
      });
      setProcessedChartData(chartData);
    }
  }, [allStudents, rawAttendance]);


  // Event handler for Clicking on bar in chart
  const handleBarClick = (data: any, index: number) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const payload = data.activePayload[0].payload as ProcessedChartDataPoint;
      setSelectedBarDate(payload.originalDate);
    } else {
      // Fallback if direct click on bar element
      const clickedData = processedChartData[index];
      if (clickedData) {
        setSelectedBarDate(clickedData.originalDate);
      }
    }
  };

  // --- Memoized Derived Data ---
  const presentStudentsOnSelectedDate = useMemo(() => {
    if (!selectedBarDate || allStudents.length === 0) return [];
    const log = rawAttendance.find(r => r.date === selectedBarDate);
    if (!log) return [];
    return log.present.map(id => {
      const student = allStudents.find(s => s.id === id);
      return student ? student.name : `ID: ${id}`;
    });
  }, [selectedBarDate, rawAttendance, allStudents]);

  const studentSpecificAttendanceData = useMemo(() => {
    if (!selectedStudentId || rawAttendance.length === 0) return [];
    const studentIdNum = parseInt(selectedStudentId, 10);
    return rawAttendance.map(log => ({
      date: log.date.substring(5),
      status: log.present.includes(studentIdNum) ? 'Present' : 'Absent',
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedStudentId, rawAttendance]);


  if (loadingStudents || loadingAttendance) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading class & student data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-4 sm:p-6 md:p-8 text-white">
      <div className="container mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-green-500 to-yellow-500">
            Attendance Tracker
          </h1>
          <p className="mt-3 text-lg bg-gradient-to-r from-blue-400 via-green-500 to-yellow-500 bg-clip-text text-transparent">
            Overall Attendance Overview (May 2025)
          </p>
        </header>

        {/* Overall Attendance Chart Section */}
        <section className="bg-slate-800 shadow-2xl rounded-xl p-6 sm:p-8 mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-slate-100 border-b border-slate-700 pb-3 bg-gradient-to-r from-blue-400 via-green-500 to-yellow-500 bg-clip-text text-transparent">
            Daily Attendance (%)
          </h2>
          {processedChartData.length > 0 ? (
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <BarChart
                  data={processedChartData}
                  onClick={handleBarClick}
                  margin={{ top: 5, right: 20, left: -10, bottom: 50 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                  <XAxis dataKey="date" stroke="#A0AEC0" tick={{ fontSize: 12, fill: '#CBD5E0' }} angle={-45} textAnchor="end" interval={0} />
                  <YAxis stroke="#A0AEC0" tick={{ fontSize: 12, fill: '#CBD5E0' }} label={{ value: 'Attendance (%)', angle: -90, position: 'insideLeft', fill: '#CBD5E0', dy: 40, dx: -5, fontSize: 14 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568', borderRadius: '0.5rem' }}
                    labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                    itemStyle={{ color: '#A0AEC0' }}
                    formatter={(value: number, name: string, props: any) => {
                      const percentage = value;
                      const totalPresent = props.payload.presentStudentIds.length;
                      const totalStudents = allStudents.length;
                      return [`${percentage}% (${totalPresent}/${totalStudents})`, "Attendance"];
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#E2E8F0', paddingTop: '20px' }} />
                  <Bar dataKey="attendancePercentage" name="Daily Attendance %" radius={[4, 4, 0, 0]} cursor="pointer">
                    {processedChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.originalDate === selectedBarDate ? '#a78bfa' : '#8884d8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-slate-400">No attendance data available.</p>
          )}

          {/* Display for clicked bar data */}
          {selectedBarDate && presentStudentsOnSelectedDate.length > 0 && (
            <div className="mt-8 p-6 bg-slate-700 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-purple-300">
                Students Present on {new Date(selectedBarDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}:
              </h3>
              <ul className="list-disc list-inside columns-2 sm:columns-3 md:columns-4 gap-x-4">
                {presentStudentsOnSelectedDate.map((name, index) => (
                  <li key={index} className="text-slate-200 text-sm mb-1">{name}</li>
                ))}
              </ul>
            </div>
          )}
          {selectedBarDate && presentStudentsOnSelectedDate.length === 0 && (
            <div className="mt-8 p-4 bg-slate-700 rounded-lg">
              <p className="text-slate-300">No students recorded as present for {selectedBarDate}.</p>
            </div>
          )}
        </section>

        {/* Student Specific Attendance Section */}
        <section className="bg-slate-800 shadow-2xl rounded-xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-slate-100 border-b border-slate-700 pb-3">
            Individual Student Attendance
          </h2>
          <div className="mb-6">
            <label htmlFor="student-select" className="block text-sm font-medium text-slate-300 mb-1">
              Select Student:
            </label>
            <select
              id="student-select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="block w-full max-w-xs bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
            >
              <option value="">-- Select a Student --</option>
              {allStudents.map(student => (
                <option key={student.id} value={student.id.toString()}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          {selectedStudentId && studentSpecificAttendanceData.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-purple-300">
                Attendance for {allStudents.find(s => s.id === parseInt(selectedStudentId))?.name || 'Selected Student'}:
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date (May)</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800 divide-y divide-slate-700">
                    {studentSpecificAttendanceData.map((record, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-slate-700/30" : ""}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-200">{record.date}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${record.status === 'Present' ? 'text-green-400' : 'text-red-400'}`}>
                          {record.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {selectedStudentId && studentSpecificAttendanceData.length === 0 && (
            <p className="text-slate-400">No attendance data found for this period for the selected student.</p>
          )}
        </section>

      </div>
    </main>
  );
}
