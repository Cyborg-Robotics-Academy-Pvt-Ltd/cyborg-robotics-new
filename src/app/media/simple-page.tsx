"use client";
import React from "react";

export default function SimpleMediaPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Simple Media Page</h1>
        <p className="text-gray-600 mb-4">
          This is a simplified version of the media page to test routing.
        </p>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>If you can see this, the /media route is working correctly.</p>
          <p className="mt-2 text-sm text-gray-500">
            The lambda route issue should be resolved.
          </p>
        </div>
      </div>
    </div>
  );
}
