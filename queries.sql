CREATE TABLE books(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL 
);

CREATE TABLE books_details(
    id SERIAL PRIMARY KEY,
    _date DATE NOT NULL, 
    rating smallint not null check (rating between 1 and 10),
    notes TEXT,
    books_id INTEGER REFERENCES books(id) 
);

INSERT INTO book_notes(book_id, note)
VALUES (50, 'Brian Augustyns take on Batman brings a fresh perspective to the Dark Knight, delving deep into the psyche of the iconic superhero while delivering an exhilarating and action-packed narrative. In this gripping tale, Augustyn showcases Batman not only as a symbol of justice but also as a complex and flawed individual grappling with his own inner demons.One of the standout aspects of Augustyns portrayal is his ability to humanize Batman, allowing readers to connect with the character on a deeper level. Through intricate storytelling and compelling dialogue, Augustyn explores Batmans vulnerabilities, doubts, and moral dilemmas, making him more relatable and compelling than ever before.Furthermore, Augustyns mastery of suspense and tension keeps readers on the edge of their seats from start to finish. Whether Batman is facing off against his iconic rogues gallery or investigating a complex crime spree in Gotham City, the pacing never falters, ensuring a thrilling and immersive reading experience.Another highlight of Augustyns work is his attention to detail and reverence for Batmans rich mythology. While offering a fresh perspective, Augustyn stays true to the core elements that have made Batman a beloved character for generations, paying homage to his iconic history while also pushing the boundaries of what the character can be.Overall, Brian Augustyns Batman is a must-read for fans of the Caped Crusader and newcomers alike. With its compelling storytelling, complex characterizations, and pulse-pounding action, this book is sure to leave a lasting impression on readers and remind them why Batman continues to be one of the most enduring and beloved superheroes of all time.')

INSERT INTO books_details(_date, rating, notes, books_id)
VALUES (2023-08-02, 10/10, 'Power is the capacity or ability to get things done.It determines whether you can or can’t influence your environment.It gives you a sense of mastery over your life.All power is based on perception.If you think you’ve got it, then you’ve got it.You have more power if you believe you have power and view your life’s encounters as negotiations.Most people firmly believe that they can’t negotiate.This is a prime example of creating a self-fulfilling prophecy.Force yourself to go outside your own experience by vigorously testing your assumptions.You’ll discover, to your astonishment, that many of them are false.Always have a sense of mastery over your situation.Pick and choose your opportunities based upon your needs.Don’t allow yourself to be manipulated or intimidated by those who aren’t concerned with your best interests.You have the freedom to choose your attitude toward any given set of circumstances and the ability to affect the outcome.You can play a much greater role than you thought in shaping your life and improving your lifestyle.Unreality is the true source of powerlessness.What we do not understand, we cannot control.If life is a game, negotiation is a way of life.You must be reality oriented - seeing things as they really are without passing judgment.“See it like it is!”Take into account hard-nosed realities affecting everyone.In politics, poker, and negotiation, success derives not only from holding a strong hand, but from analyzing the total situation so cards can be skillfully played.To influence an outcome, you must realistically analyze the other side’s position, as well as your own, in light of POWER, TIME, INFORMATION.Whether you think you can or think you can’t, you’re right.Power isn’t good or bad.It isn’t moral or immoral.It isn’t ethical or unethical.It’s neutral.Power is a way of getting from one place to another.You’re at position A (your present situation or predicament).You want to go to position B (your objective, goal, or destination).Power enables you to go from A to B.It enables you to change your reality to achieve that goal.', 1)