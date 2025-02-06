import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import firebaseApp from "./firebase";
import { Editor } from "@tinymce/tinymce-react";
import { Button, Select } from "@/components/ui/button";

const themes = ["light", "dark", "sepia", "night"];
const fonts = ["Arial", "Georgia", "Courier New", "Times New Roman", "Verdana"];
const backgrounds = ["#ffffff", "#f4f4f4", "#333333", "#1a1a2e", "#ffe4b5"];

function DiaryApp() {
    const [user, setUser] = useState(null);
    const [diary, setDiary] = useState("Start writing your thoughts...");
    const [entries, setEntries] = useState([]);
    const [theme, setTheme] = useState("light");
    const [font, setFont] = useState("Arial");
    const [background, setBackground] = useState("#ffffff");

    useEffect(() => {
        onAuthStateChanged(getAuth(firebaseApp), (user) => setUser(user));
        fetchEntries();
    }, []);

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        await axios.post("https://your-server-url.com/diary", { token, entry: diary });
        setDiary("");
        fetchEntries();
    };

    const fetchEntries = async () => {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("https://your-server-url.com/diary", {
            headers: { Authorization: `Bearer ${token}` },
        });
        setEntries(data);
    };

    return (
        <div className={`app theme-${theme}`} style={{ backgroundColor: background, fontFamily: font }}>
            {user ? (
                <div>
                    <h1>Welcome {user.email}</h1>
                    <Editor
                        initialValue={diary}
                        init={{
                            height: 300,
                            menubar: false,
                            plugins: "lists link image",
                            toolbar: "undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent",
                        }}
                        onEditorChange={(content) => setDiary(content)}
                    />
                    <Button onClick={handleSubmit}>Save Entry</Button>
                    <Button onClick={() => fetchEntries()}>Load Entries</Button>
                    <Button onClick={() => signOut(getAuth(firebaseApp))}>Logout</Button>
                    <div>
                        <h3>Customize:</h3>
                        <Select onChange={(e) => setTheme(e.target.value)}>{themes.map(t => <option key={t}>{t}</option>)}</Select>
                        <Select onChange={(e) => setFont(e.target.value)}>{fonts.map(f => <option key={f}>{f}</option>)}</Select>
                        <Select onChange={(e) => setBackground(e.target.value)}>{backgrounds.map(b => <option key={b}>{b}</option>)}</Select>
                    </div>
                    <ul>
                        {entries.map((entry, index) => (
                            <li key={index} dangerouslySetInnerHTML={{ __html: entry.entry }}></li>
                        ))}
                    </ul>
                </div>
            ) : (
                <h2>Please log in to continue</h2>
            )}
        </div>
    );
}

export default DiaryApp;
