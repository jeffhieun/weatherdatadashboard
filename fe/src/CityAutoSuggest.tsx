import React, { useState, useRef } from "react";
import axios from "axios";
import { debounce } from "./debounce";
import "./styles.css";

export interface CitySuggestion {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

interface Props {
  onSelect: (city: CitySuggestion) => void;
}

export const CityAutoSuggest: React.FC<Props> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIdx, setActiveIdx] = useState(-1);

  const fetchSuggestions = debounce(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get<CitySuggestion[]>(`/api/cities/search?query=${encodeURIComponent(q)}`);
      setSuggestions(res.data);
      setShowDropdown(true);
    } catch {
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
    setActiveIdx(-1);
  };

  const handleSelect = (city: CitySuggestion) => {
    setQuery(`${city.name}, ${city.country}`);
    setShowDropdown(false);
    onSelect(city);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      setActiveIdx((idx) => (idx + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      setActiveIdx((idx) => (idx - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && activeIdx >= 0) {
      handleSelect(suggestions[activeIdx]);
    }
  };

  return (
    <div className="city-autosuggest">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Enter city name"
        autoComplete="off"
        className="city-input"
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        onKeyDown={handleKeyDown}
      />
      {loading && (
        <div className="city-loading"><span className="spinner" /></div>
      )}
      {showDropdown && suggestions.length > 0 && !loading && (
        <ul className="city-dropdown">
          {suggestions.map((city, idx) => (
            <li
              key={city.name + city.lat + city.lon}
              className={
                "city-dropdown-item" + (idx === activeIdx ? " city-dropdown-item--active" : "")
              }
              onMouseDown={() => handleSelect(city)}
              onMouseEnter={() => setActiveIdx(idx)}
            >
              <span className="city-name">{city.name}</span>, <span className="city-country">{city.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
