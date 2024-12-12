from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Meeting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    date = db.Column(db.String(10), nullable=False)
    time = db.Column(db.String(5), nullable=False)
    description = db.Column(db.String(250), nullable=True)
    type = db.Column(db.String(50), nullable=False)

with app.app_context():
    db.create_all()

# Using ORM for creating a new meeting
@app.route('/api/meetings', methods=['POST'])
def create_meeting():
    data = request.json
    try:
        new_meeting = Meeting(
            title=data['title'],
            date=data['date'],
            time=data['time'],
            description=data.get('description'),
            type=data.get('type', 'General')
        )
        db.session.add(new_meeting)
        db.session.commit()
        return jsonify({'id': new_meeting.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Using ORM for retrieving meetings
@app.route('/api/meetings', methods=['GET'])
def get_meetings():
    meetings = Meeting.query.all()
    return jsonify([{
        'id': meeting.id,
        'title': meeting.title,
        'date': meeting.date,
        'time': meeting.time,
        'description': meeting.description,
        'type': meeting.type
    } for meeting in meetings])

# Using prepared statements to update a meeting
@app.route('/api/meetings/<int:id>', methods=['PUT'])
def update_meeting(id):
    data = request.json
    try:
        query = """
        UPDATE meeting
        SET title = :title, date = :date, time = :time, description = :description, type = :type
        WHERE id = :id
        """
        db.session.execute(query, {
            'id': id,
            'title': data['title'],
            'date': data['date'],
            'time': data['time'],
            'description': data.get('description'),
            'type': data.get('type', 'General')
        })
        db.session.commit()
        return jsonify({'message': 'Meeting updated'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Using prepared statements to delete a meeting
@app.route('/api/meetings/<int:id>', methods=['DELETE'])
def delete_meeting(id):
    try:
        query = "DELETE FROM meeting WHERE id = :id"
        db.session.execute(query, {'id': id})
        db.session.commit()
        return jsonify({'message': 'Meeting deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
