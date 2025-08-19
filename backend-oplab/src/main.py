import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import json
import time
import logging
from flask import Flask, send_from_directory, request, g
from flask_cors import CORS
from src.models.user import db
from src.models.audit import AuditLog
from src.routes.user import user_bp
from src.routes.oplab import oplab_bp, metrics

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for all routes
CORS(app, origins="*")

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(oplab_bp)

# uncomment if you need to use database
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()


logger = logging.getLogger("oplab")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter('%(message)s'))
    logger.addHandler(handler)
logger.setLevel(logging.INFO)


@app.before_request
def start_request():
    if request.path.startswith('/api'):
        g.start_time = time.time()
        g.cache_hits_before = metrics['cache_hits']


@app.after_request
def log_request(response):
    if request.path.startswith('/api') and hasattr(g, 'start_time'):
        duration = time.time() - g.start_time
        cache_hits = metrics['cache_hits'] - g.cache_hits_before
        metrics['requests'] += 1
        metrics['total_response_time'] += duration
        error_msg = None
        if response.status_code >= 400:
            try:
                error_msg = response.get_json().get('error')
            except Exception:
                pass
        log_entry = {
            'event': 'request',
            'endpoint': request.path,
            'duration': duration,
            'cache_hits': cache_hits,
            'status': response.status_code
        }
        if error_msg:
            log_entry['error'] = error_msg
        logger.info(json.dumps(log_entry))
        audit = AuditLog(endpoint=request.path,
                         response_time=duration,
                         cache_hits=cache_hits,
                         status=response.status_code,
                         error=error_msg)
        db.session.add(audit)
        db.session.commit()
    return response

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
